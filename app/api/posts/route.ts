// Place this file in: /app/api/posts/route.ts

import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import siteMetadata from '@/data/siteMetadata'

export async function POST(req: Request) {
  try {
    const { rawMdx, slug } = await req.json() as { rawMdx: string; slug: string }
    if (!rawMdx || !slug) {
      return NextResponse.json(
        { error: 'Missing rawMdx or slug in the request body.' },
        { status: 400 }
      )
    }

    // Parse the MDX file to separate frontmatter and content.
    const { content, data: frontmatter } = matter(rawMdx)

    // Ensure SEO metadata is present. If missing, use default values.
    const updatedFrontmatter = {
      ...frontmatter,
      // Directly use title and summary for SEO, falling back to site defaults if missing.
      title: frontmatter.title || siteMetadata.title,
      description: frontmatter.summary || siteMetadata.description,
    }

    // Rebuild the MDX file with the updated frontmatter.
    const updatedMDX = matter.stringify(content, updatedFrontmatter)

    // Define the directory and file path.
    const blogDir = path.join(process.cwd(), 'data', 'blog')
    try {
      await fs.access(blogDir)
    } catch {
      await fs.mkdir(blogDir, { recursive: true })
    }
    const filePath = path.join(blogDir, `${slug}.mdx`)
    await fs.writeFile(filePath, updatedMDX, 'utf8')

    return NextResponse.json({ message: 'Post saved successfully', filePath })
  } catch (error: unknown) {
    console.error('Error saving post:', error)
    return NextResponse.json({ error: 'Error saving post' }, { status: 500 })
  }
}
