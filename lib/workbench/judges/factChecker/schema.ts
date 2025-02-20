// File: lib/workbench/judges/factChecker/schema.ts

import { z } from 'zod'

/**
 * Schema for determining if the blog is intended to be factual.
 */
export const FactualityDecisionSchema = z.object({
  factual: z
    .boolean()
    .describe('Whether the blog is intended to be factual (true) or non-factual (false)'),
})
export type FactualityDecisionOutput = z.infer<typeof FactualityDecisionSchema>

/**
 * Schema for extracting factual claims.
 */
export const FactSchema = z.object({
  claims: z.array(
    z.object({
      text: z.string().describe('The factual claim extracted from the blog post.'),
      is_verifiable: z
        .boolean()
        .describe('Whether this claim can be verified using external sources.'),
    })
  ),
})
export type FactExtractionOutput = z.infer<typeof FactSchema>

/**
 * Schema for a single fact-check result.
 */
export const SingleClaimCheckSchema = z.object({
  text: z.string().describe('The original claim.'),
  verifiable: z.boolean().describe('Indicates if the claim was verifiable.'),
  correctness: z.enum(['true', 'false', 'uncertain']).describe('The fact-check result.'),
  source: z.string().optional().describe('A credible source URL, if available.'),
  explanation: z.string().describe('Explanation for the fact-check result.'),
})
export type SingleClaimCheckOutput = z.infer<typeof SingleClaimCheckSchema>

/**
 * Schema for the overall fact-check output.
 */
export const FactCheckSchema = z.object({
  checked_claims: z.array(SingleClaimCheckSchema),
})
export type FactCheckOutput = z.infer<typeof FactCheckSchema>
