// File: lib/workbench/judges/relevanceChecker/index.ts

import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage } from '@langchain/core/messages'
import { relevanceJudgePromptV1 } from './prompts'
import { RelevanceSchema, RelevanceOutput } from './schema'

/**
 * Evaluates the relevance and intent alignment of a generated blog post.
 *
 * @param topic - The original topic the user requested.
 * @param generatedContent - The LLM-generated blog post.
 * @returns A structured output containing a numeric score (0-10) and qualitative explanation.
 */
export async function runRelevanceJudge({
  topic,
  generatedContent,
}: {
  topic: string
  generatedContent: string
}): Promise<RelevanceOutput> {
  const model = new ChatOpenAI({
    model: 'gpt-4o-mini',
    temperature: 0.2, // Lower temperature for consistent evaluations
    apiKey: process.env.OPENAI_API_KEY,
  }).withStructuredOutput(RelevanceSchema, { name: 'Relevance Evaluation' }) // Enforce structured JSON output

  const response = await model.invoke([
    new HumanMessage(relevanceJudgePromptV1(topic, generatedContent)),
  ])

  return response // Structured response as { score: number, explanation: string }
}
