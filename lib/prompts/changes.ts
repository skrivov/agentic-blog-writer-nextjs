// File: /lib/prompts/changes.ts

export const modificationPromptV1 = (rawMdx: string, changes: string): string =>
    `Below is an existing blog post in MDX format (including YAML frontmatter):
${rawMdx}

Using the following modifications, update the blog post accordingly.
Ensure that the YAML frontmatter (title, date, tags, draft, summary) is preserved.
Return only the modified MDX content (including the YAML frontmatter) with no additional commentary or explanation.
Suggested modifications: ${changes}`;
