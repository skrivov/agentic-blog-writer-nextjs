// File: /lib/workflows/deepResearch/index.ts

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { StateGraph, Annotation } from "@langchain/langgraph";
import { StringOutputParser } from "@langchain/core/output_parsers";
import type { HandlerParams } from "../../types";
import {
    researchSummaryPrompt,
    draftBlogPrompt,
    refineBlogPrompt,
    seoPrompt,
    formatMdxPrompt,
} from "./prompts";

// Import the latest Tavily retriever
import { TavilySearchAPIRetriever } from "@langchain/community/retrievers/tavily_search_api";

// Instantiate your LLM (using GPT‑4)
const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.7,
    apiKey: process.env.OPENAI_API_KEY,
});

// Instantiate the TavilySearchAPIRetriever (set k to 3 or adjust as needed)
const retriever = new TavilySearchAPIRetriever({
    k: 3,
    // Optionally pass your API key directly:
    // apiKey: process.env.TAVILY_API_KEY,
});

// Set the number of iterative refinement cycles (default is 1)
const MAX_ITERATIONS = 1;

// Define the state using LangGraph's Annotation system
const StateAnnotation = Annotation.Root({
    topic: Annotation<string>(),
    // aggregated search results as a string (concatenation of titles and content)
    searchResults: Annotation<string>(),
    summary: Annotation<string>(),
    draft: Annotation<string>(),
    refined: Annotation<string>(),
    iteration: Annotation<number>({ value: (_, next) => next, default: () => 0 }),
    seoData: Annotation<string>(), // raw JSON string from SEO prompt
    finalMdx: Annotation<string>(),
});

// Node: Conduct research using TavilySearchAPIRetriever
async function researchNode(state: typeof StateAnnotation.State) {
    // Use the retriever to fetch documents based on the topic.
    const results = await retriever.invoke(state.topic);

    // Aggregate the search results: join the title (from metadata) and the content.
    const aggregated = results
        .map((doc: any) => `${doc.metadata.title}: ${doc.pageContent}`)
        .join("\n");
    return { searchResults: aggregated };
}

// Node: Summarize the research results
async function summarizeNode(state: typeof StateAnnotation.State) {
    const prompt = researchSummaryPrompt(state.topic, state.searchResults);
    const response = await llm.invoke([new HumanMessage(prompt)]);
    return { summary: response.content };
}

// Node: Draft the blog post based on the research summary
async function draftNode(state: typeof StateAnnotation.State) {
    const prompt = draftBlogPrompt(state.topic, state.summary);
    const response = await llm.invoke([new HumanMessage(prompt)]);
    return { draft: response.content };
}

// Node: Refine the blog draft (iterative refinement)
async function refineNode(state: typeof StateAnnotation.State) {
    const prompt = refineBlogPrompt(state.draft);
    const response = await llm.invoke([new HumanMessage(prompt)]);
    return { refined: response.content, iteration: state.iteration + 1 };
}

// Node: SEO optimization (using JSON output parsing as before)
import { JsonOutputParser } from "@langchain/core/output_parsers";

// Define the expected SEO output type (optional)
interface SEOData {
    title: string;
    meta: string;
    content: string;
}

async function seoNode(state: typeof StateAnnotation.State) {
    const prompt = seoPrompt(state.topic, state.refined);
    const response = await llm.invoke([new HumanMessage(prompt)]);

    // Use the JSON output parser to parse the response.
    const parser = new JsonOutputParser<SEOData>();
    const rawOutput = typeof response.content === "string"
        ? response.content
        : response.content.toString();
    const seoData: SEOData = await parser.parse(rawOutput);
    return { seoData: JSON.stringify(seoData) };
}

// Node: Format final output in MDX
async function formatNode(state: typeof StateAnnotation.State) {
    const seoData = JSON.parse(state.seoData);
    const prompt = formatMdxPrompt(seoData);
    const response = await llm.invoke([new HumanMessage(prompt)]);
    return { finalMdx: response.content };
}

// Conditional edge function for iterative refinement.
// If iteration < MAX_ITERATIONS, loop back to refine; otherwise, proceed to SEO.
function afterRefine(state: typeof StateAnnotation.State) {
    return state.iteration < MAX_ITERATIONS ? "refine" : "seo";
}

// Build the LangGraph workflow
// Build the LangGraph workflow
const deepResearchGraph = new StateGraph(StateAnnotation)
    .addNode("research", researchNode)
    .addNode("summarize", summarizeNode)
    // Renamed the "draft" node to "createDraft" to avoid conflict with state attribute "draft"
    .addNode("createDraft", draftNode)
    .addNode("refine", refineNode)
    .addNode("seo", seoNode)
    .addNode("format", formatNode)
    .addEdge("__start__", "research")
    .addEdge("research", "summarize")
    // Update edge: from "summarize" to "createDraft"
    .addEdge("summarize", "createDraft")
    // Update edge: from "createDraft" to "refine"
    .addEdge("createDraft", "refine")
    .addConditionalEdges("refine", afterRefine, {
        refine: "refine",
        seo: "seo",
    })
    .addEdge("seo", "format")
    .addEdge("format", "__end__")
    .compile();

// Main entry function for the Deep Research workflow
export async function runDeepResearch({ prompt, rawMdx }: HandlerParams): Promise<string> {
    // This workflow is only for new blogs; rawMdx is ignored.
    const state = await deepResearchGraph.invoke({ topic: prompt });
    return state.finalMdx;
}
