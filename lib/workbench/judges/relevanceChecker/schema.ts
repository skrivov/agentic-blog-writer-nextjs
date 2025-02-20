// File: lib/workbench/judges/relevanceChecker/schema.ts

import { z } from 'zod'

/**
 * Defines the structured output schema for relevance evaluation.
 */
export const RelevanceSchema = z.object({
  score: z.number().min(0).max(10).describe('Relevance score of the generated blog post (0-10).'),
  explanation: z
    .string()
    .describe('A detailed explanation justifying the assigned relevance score.'),
})

export type RelevanceOutput = z.infer<typeof RelevanceSchema>
