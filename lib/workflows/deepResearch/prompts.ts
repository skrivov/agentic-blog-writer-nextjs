import { mdxFormattingInstructionsV1 } from '../../prompts/mdxFormatting'

/**
 * researchSummaryPrompt:
 * Given a topic and a list of search results, instructs the LLM to produce a summary.
 */
export const researchSummaryPromptV1 = (topic: string, searchResults: string): string =>
  `You are a research assistant. Summarize the following search results on the topic "${topic}" focusing on key insights and relevant information. Present a clear, concise summary.

Search Results:
${searchResults}

Summary:`

/**
 * draftBlogPrompt:
 * Given a topic and a research summary, instructs the LLM to draft a structured blog post.
 */
export const draftBlogPromptV1 = (topic: string, summary: string): string =>
  `Write a comprehensive blog post on the topic "${topic}" using the following research summary. Structure the blog post into three sections: Introduction, Main Points, and Conclusion. Ensure the content is detailed, engaging, and accurate.

Research Summary:
${summary}

Blog Post Draft:`

/**
 * refineBlogPrompt:
 * Given an existing blog draft, instructs the LLM to refine the content.
 */
export const refineBlogPromptV1 = (draft: string): string =>
  `You are an expert editor. Refine the following blog draft for clarity, accuracy, and flow. Do not change the overall structure (Introduction, Main Points, Conclusion). Provide an improved version of the blog post.

Draft:
${draft}

Refined Draft:`

/**
 * seoPrompt:
 * Given a refined blog draft, instructs the LLM to optimize the content for SEO.
 */
export const seoPromptV1 = (topic: string, refinedDraft: string): string =>
  `You are an SEO expert. Optimize the following blog draft for search engine visibility. Do the following:
1. Propose a catchy, SEO-optimized title for the blog post.
2. Write a meta description (around 155 characters) that highlights the blog's content.
3. Ensure the blog post is well-structured with appropriate headings (Introduction, Main Points, Conclusion) and includes relevant keywords naturally.
   
Topic: "${topic}"
Blog Draft:
${refinedDraft}

Provide the output in the following JSON format:
{
  "title": string,
  "meta": string,
  "content": string
}`

/**
 * formatMdxPrompt:
 * Given the SEO optimized content (with title and meta), instructs the LLM to format the final output in MDX.
 * It uses a pre-defined MDX formatting instruction that includes the current date and does not output an H1 title.
 */
export const formatMdxPromptV1 = (seoOptimized: {
  title: string
  meta: string
  content: string
}): string =>
  `Format the following blog content into a well-formatted MDX file.
${mdxFormattingInstructionsV1()}

Now format the content below into MDX:

Title: ${seoOptimized.title}

Meta Description: ${seoOptimized.meta}

Content:
${seoOptimized.content}`
