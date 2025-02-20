// File: lib/workbench/judges/factChecker/index.ts

import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage } from '@langchain/core/messages'
import { StateGraph, Annotation } from '@langchain/langgraph'
import { TavilySearchAPIRetriever } from '@langchain/community/retrievers/tavily_search_api'
import {
  FactualityDecisionSchema,
  FactSchema,
  FactCheckSchema,
  SingleClaimCheckOutput,
  FactExtractionOutput,
  SingleClaimCheckSchema,
  FactCheckOutput,
} from './schema'
import {
  assessFactualityPromptV1,
  extractClaimsPromptV1,
  factCheckWithSearchPromptV1,
} from './prompts'

// Initialize the LLM.
const llm = new ChatOpenAI({
  model: 'gpt-4o-mini',
  temperature: 0.2,
  apiKey: process.env.OPENAI_API_KEY,
})

// Instantiate TavilySearchAPIRetriever (set k to 3 or adjust as needed).
const searchRetriever = new TavilySearchAPIRetriever({
  k: 3,
  // Optionally, provide your API key: apiKey: process.env.TAVILY_API_KEY,
})

// Define the state for the fact-checking workflow.
const FactCheckState = Annotation.Root({
  topic: Annotation<string>(),
  blogContent: Annotation<string>(),
  factualDecision: Annotation<string>(), // JSON string from FactualityDecisionSchema
  extractedClaims: Annotation<string>(), // JSON string from FactSchema
  checkedFacts: Annotation<string>(), // JSON string from FactCheckSchema
})

/**
 * Node: Assess whether the blog is intended to be factual.
 */
async function assessFactuality(state: typeof FactCheckState.State) {
  const structuredLlm = llm.withStructuredOutput(FactualityDecisionSchema, {
    name: 'Factuality Decision',
  })
  const response = await structuredLlm.invoke([
    new HumanMessage(assessFactualityPromptV1(state.topic, state.blogContent)),
  ])
  console.log('Factuality Decision:', response)
  return { factualDecision: JSON.stringify(response) }
}

/**
 * Node: Skip fact-checking and return an empty result.
 */
async function skipFactCheck(state: typeof FactCheckState.State) {
  console.log('Skipping fact-checking because blog is non-factual.')
  return { checkedFacts: JSON.stringify({ checked_claims: [] }) }
}

/**
 * Node: Extract factual claims from the blog post.
 */
async function extractClaims(state: typeof FactCheckState.State) {
  const structuredLlm = llm.withStructuredOutput(FactSchema, { name: 'Fact Extraction' })
  const response: FactExtractionOutput = await structuredLlm.invoke([
    new HumanMessage(extractClaimsPromptV1(state.blogContent)),
  ])
  console.log('Extracted Claims:', response)
  return { extractedClaims: JSON.stringify(response) }
}

/**
 * Node: For each verifiable claim, perform an external search via Tavily and fact-check it.
 */
async function checkFacts(state: typeof FactCheckState.State) {
  const claimsData: FactExtractionOutput = JSON.parse(state.extractedClaims)
  const verifiableClaims = claimsData.claims.filter((claim) => claim.is_verifiable)

  if (verifiableClaims.length === 0) {
    return { checkedFacts: JSON.stringify({ checked_claims: [] }) }
  }

  // Explicitly type the array
  const checkedClaims: SingleClaimCheckOutput[] = []

  // For each verifiable claim:
  for (const claim of verifiableClaims) {
    // Perform an external search using Tavily.
    const searchResultsDocs = await searchRetriever.invoke(claim.text)
    const aggregatedResults = searchResultsDocs
      .map((doc: any) => `${doc.metadata.title}: ${doc.pageContent}`)
      .join('\n')

    // Prepare the prompt for fact-checking this claim.
    const prompt = factCheckWithSearchPromptV1(claim.text, aggregatedResults)

    // Use structured output to verify the claim.
    const structuredLlmForClaim = llm.withStructuredOutput(SingleClaimCheckSchema, {
      name: 'Single Fact Check',
    })
    const claimResult: SingleClaimCheckOutput = await structuredLlmForClaim.invoke([
      new HumanMessage(prompt),
    ])
    console.log('Checked Claim:', claimResult)
    // Now push into our explicitly typed array
    checkedClaims.push(claimResult)
  }

  return { checkedFacts: JSON.stringify({ checked_claims: checkedClaims }) }
}

/**
 * Conditional edge function after assessing factuality.
 * If the blog is factual, proceed to extract claims; otherwise, skip fact-checking.
 */
function afterAssessFactuality(state: typeof FactCheckState.State): string {
  const decision = JSON.parse(state.factualDecision) as { factual: boolean }
  return decision.factual ? 'extractClaims' : 'skip'
}

// Build the LangGraph workflow.
const factCheckGraph = new StateGraph(FactCheckState)
  .addNode('assessFactuality', assessFactuality)
  .addNode('skip', skipFactCheck)
  .addNode('extractClaims', extractClaims)
  .addNode('checkFacts', checkFacts)
  .addEdge('__start__', 'assessFactuality')
  .addConditionalEdges('assessFactuality', afterAssessFactuality, {
    extractClaims: 'extractClaims',
    skip: 'skip',
  })
  .addEdge('extractClaims', 'checkFacts')
  .addEdge('checkFacts', '__end__')
  .compile()

/**
 * Top-level function to run the Fact Check Judge.
 *
 * It first uses the LLM to assess if the blog should be fact-checked.
 * If so, it extracts verifiable claims and then fact-checks each claim using external search results.
 *
 * @param topic - The blog topic.
 * @param generatedContent - The AI-generated blog post content.
 * @returns A structured JSON object with fact-checking results.
 */
export async function runFactCheckJudge({
  topic,
  generatedContent,
}: {
  topic: string
  generatedContent: string
}): Promise<FactCheckOutput> {
  const state = await factCheckGraph.invoke({ topic, blogContent: generatedContent })
  return JSON.parse(state.checkedFacts)
}
