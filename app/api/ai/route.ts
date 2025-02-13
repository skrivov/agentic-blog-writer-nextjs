// File: /app/api/ai/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { workflows } from '@/lib/workflowsConfig'
import { serialize } from 'next-mdx-remote/serialize'
import matter from 'gray-matter'

// Import the plugins.
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import rehypePrismPlus from 'rehype-prism-plus'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

export async function POST(request: NextRequest) {
  try {
    const { workflowKey, prompt, rawMdx } = (await request.json()) as {
      workflowKey: string
      prompt: string
      rawMdx?: string
    }

    if (!workflowKey || !prompt) {
      return NextResponse.json(
        { error: 'Missing "workflowKey" or "prompt" in request body.' },
        { status: 400 }
      )
    }

    const workflow = workflows.find((w) => w.key === workflowKey)
    if (!workflow) {
      return NextResponse.json(
        { error: `No workflow found for key: ${workflowKey}` },
        { status: 400 }
      )
    }

    // Call the workflow's handler.
    const outputMDX = await workflow.handler({ prompt, rawMdx })
    const trimmedMDX = outputMDX.trim()

    // (If your MDX output from the LLM is wrapped in code fences, remove them)
    let mdxContent = trimmedMDX
    if (mdxContent.startsWith('```mdx')) {
      mdxContent = mdxContent.replace(/^```mdx\s*/, '')
      if (mdxContent.endsWith('```')) {
        mdxContent = mdxContent.slice(0, -3)
      }
      mdxContent = mdxContent.trim()
    }

    // Use gray-matter to extract the YAML frontmatter (if present)
    const parsed = matter(mdxContent)
    // Now parsed.data holds the frontmatter, and parsed.content is the MDX without the frontmatter.

    // Serialize the MDX content using the extra plugins.
    const serializedMDX = await serialize(parsed.content, {
      mdxOptions: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex, rehypePrismPlus],
      },
    })

    // For saving, rebuild the MDX file with the frontmatter.
    const rawForSaving = matter.stringify(parsed.content, parsed.data)

    return NextResponse.json({
      rawMdx: rawForSaving,
      mdx: { ...serializedMDX, frontmatter: parsed.data },
    })
  } catch (error: unknown) {
    console.error('Error in AI route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
