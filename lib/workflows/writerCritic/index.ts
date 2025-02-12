// File: /lib/workflows/writerCritic/index.ts

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { StateGraph, Annotation } from "@langchain/langgraph";
import type { HandlerParams } from "../../types";
import { writerInitialPrompt, writerRevisionPrompt, criticPrompt, formatPrompt } from "./prompts";

// Constant to control how many writer/critic cycles to run (default is 1)
const MAX_ITERATIONS = 1;

// Initialize the LLM (using GPT‑4 as in your other workflows)
const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.7,
    apiKey: process.env.OPENAI_API_KEY,
});

// Define the state for the workflow using LangGraph’s Annotation system
const StateAnnotation = Annotation.Root({
    topic: Annotation<string>(),
    blogDraft: Annotation<string>(),
    suggestions: Annotation<string>(),
    iteration: Annotation<number>({ value: (_, next) => next, default: () => 0 }),
    finalBlog: Annotation<string>(),
});

/**
 * Node: writerInitial
 * Creates an initial blog post based solely on the topic.
 */
async function writerInitial(state: typeof StateAnnotation.State) {
    const prompt = writerInitialPrompt(state.topic);
    const response = await llm.invoke([new HumanMessage(prompt)]);
    return { blogDraft: response.content };
}

/**
 * Node: critic
 * Reviews the current blog post and returns suggestions for improvement.
 */
async function critic(state: typeof StateAnnotation.State) {
    const prompt = criticPrompt(state.blogDraft);
    const response = await llm.invoke([new HumanMessage(prompt)]);
    return { suggestions: response.content };
}

/**
 * Node: writerRevision
 * Revises the blog post by incorporating the critic’s suggestions and increments the revision count.
 */
async function writerRevision(state: typeof StateAnnotation.State) {
    const prompt = writerRevisionPrompt(state.blogDraft, state.suggestions);
    const response = await llm.invoke([new HumanMessage(prompt)]);
    return { blogDraft: response.content, iteration: state.iteration + 1 };
}

/**
 * Node: formatting
 * Formats the final blog post into a perfectly formatted MDX file with SEO‑friendly frontmatter.
 */
async function formatting(state: typeof StateAnnotation.State) {
    const prompt = formatPrompt(state.blogDraft);
    const response = await llm.invoke([new HumanMessage(prompt)]);
    return { finalBlog: response.content };
}

/**
 * Conditional edge function after writerInitial.
 * If MAX_ITERATIONS > 0, proceed to the critic; otherwise, skip directly to formatting.
 */
function afterWriterInitial(state: typeof StateAnnotation.State): string {
    return MAX_ITERATIONS > 0 ? "critic" : "formatting";
}

/**
 * Conditional edge function after writerRevision.
 * If the current iteration count is less than MAX_ITERATIONS, loop back to the critic node;
 * otherwise, proceed to formatting.
 */
function afterWriterRevision(state: typeof StateAnnotation.State): string {
    return state.iteration < MAX_ITERATIONS ? "critic" : "formatting";
}

// Build the LangGraph state graph for the writer‑critic workflow
const writerCriticGraph = new StateGraph(StateAnnotation)
    .addNode("writerInitial", writerInitial)
    .addNode("critic", critic)
    .addNode("writerRevision", writerRevision)
    .addNode("formatting", formatting)
    .addEdge("__start__", "writerInitial")
    .addConditionalEdges("writerInitial", afterWriterInitial, {
        critic: "critic",
        formatting: "formatting",
    })
    .addEdge("critic", "writerRevision")
    .addConditionalEdges("writerRevision", afterWriterRevision, {
        critic: "critic",
        formatting: "formatting",
    })
    .addEdge("formatting", "__end__")
    .compile();

/**
 * runWriterCritic:
 * Entry point for the workflow.
 * Receives a topic from the user (in the `prompt` property of HandlerParams)
 * and returns a fully formatted MDX blog post.
 */
export async function runWriterCritic({ prompt }: HandlerParams): Promise<string> {
    const state = await writerCriticGraph.invoke({ topic: prompt });
    return state.finalBlog;
}
