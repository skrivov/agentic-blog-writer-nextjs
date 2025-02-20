// File: lib/workbench/judges/factChecker/prompts.ts

/**
 * Prompt to decide if the blog should be fact-checked.
 *
 * @param topic - The blog topic.
 * @param blogContent - The generated blog content.
 * @returns A prompt asking for a JSON output with a single boolean field "factual".
 */
export const assessFactualityPromptV1 = (topic: string, blogContent: string): string =>
  `You are a content analyst. Given the blog topic and the content below, determine whether the blog is intended to be factual (i.e., based on verifiable information) or non-factual (e.g. fiction, satire, or fantasy).

Topic: "${topic}"
Blog Content:
${blogContent}

Output a JSON object with the following format:
{
  "factual": true   // Set to false if the blog is non-factual.
}`

/**
 * Prompt to extract factual claims from the blog post.
 *
 * @param blogContent - The blog post content.
 * @returns A prompt asking for a JSON object of claims.
 */
export const extractClaimsPromptV1 = (blogContent: string): string =>
  `You are a fact-checking assistant. Extract all factual claims from the following blog post.
  
- Identify sentences that assert real-world facts.
- For each claim, indicate whether it is verifiable using credible sources.
- Exclude opinions or subjective statements.

Output a JSON object with the following format:
{
  "claims": [
    { "text": "Claim text here.", "is_verifiable": true },
    { "text": "Another claim.", "is_verifiable": false }
  ]
}

Blog Content:
${blogContent}`

/**
 * Prompt to fact-check a single claim using external search results.
 *
 * @param claim - The factual claim to verify.
 * @param searchResults - Aggregated external search results (titles and content).
 * @returns A prompt asking for a JSON object evaluating the claim.
 */
export const factCheckWithSearchPromptV1 = (claim: string, searchResults: string): string =>
  `You are a fact-checking assistant. Verify the following factual claim using the provided external search results.

Claim: "${claim}"

External Search Results:
${searchResults}

Based on these results, decide whether the claim is:
- TRUE: Supported by credible sources.
- FALSE: Contradicted by credible sources.
- UNCERTAIN: Insufficient evidence.

Output a JSON object with this format:
{
  "text": "<original claim>",
  "verifiable": true,
  "correctness": "<true|false|uncertain>",
  "source": "<a credible source URL, or an empty string if unavailable>",
  "explanation": "<brief explanation>"
}`
