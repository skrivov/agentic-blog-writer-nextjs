// File: /lib/workflows/writerCritic/prompts.ts

import { mdxFormattingInstructionsV1 } from '../../prompts/mdxFormatting';

/**
 * writerInitialPrompt:
 * Given a topic, returns a prompt to write an engaging blog post.
 */
export const writerInitialPrompt = (topic: string): string =>
    `Write an engaging, informative, and creative blog post on the following topic:
"${topic}".
Ensure the post has a clear structure and engaging content.`;

/**
 * writerRevisionPrompt:
 * Given the current blog post and the critic's suggestions, returns a prompt to revise the blog post.
 */
export const writerRevisionPrompt = (blog: string, suggestions: string): string =>
    `Revise the following blog post based on the suggestions provided.
  
Blog Post:
${blog}

Suggestions for improvement:
${suggestions}

Incorporate the suggestions to enhance clarity, structure, and overall engagement.`;

/**
 * criticPrompt:
 * Given a blog post, returns a prompt for a critic to review it and provide constructive feedback.
 */
export const criticPrompt = (blog: string): string =>
    `You are a seasoned blog critic. Review the following blog post and provide detailed, constructive feedback for improvement (e.g. clarity, structure, engagement, and depth).
  
Blog Post:
${blog}`;

/**
 * formatPrompt:
 * Given a blog post, returns a prompt to format it into a perfectly formatted MDX file.
 * The MDX output must include a YAML frontmatter block with a catchy, SEO-friendly title and a concise description.
 */
export const formatPrompt = (blog: string): string =>
    `Format the following blog post into a perfectly formatted MDX file.
The MDX file should start with a YAML frontmatter block containing:
- **title:** A catchy, SEO‑optimized title.
- **date:** Today’s date in YYYY‑MM‑DD format.
- **tags:** An array of relevant tags.
- **draft:** false.
- **description:** A concise, SEO‑friendly description.

Use these formatting instructions:
${mdxFormattingInstructionsV1()}

Blog Post:
${blog}`;
