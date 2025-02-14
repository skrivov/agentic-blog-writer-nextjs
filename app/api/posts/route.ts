// Place this file in: /app/api/posts/route.ts

import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import siteMetadata from '@/data/siteMetadata'
import { rebuildContentlayer } from '@/lib/contentlayer/rebuildContentlayer'
import { exec } from 'child_process'

export async function POST(req: Request) {
  try {
    // Parse the JSON request body for rawMdx and slug
    const { rawMdx, slug } = (await req.json()) as { rawMdx: string; slug: string }
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
      description: frontmatter.description || siteMetadata.description,
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

    // Trigger on-demand revalidation in production mode.
    // This ensures that the "/blog" route is rebuilt on the next request with the latest data.
    if (process.env.NODE_ENV === 'production') {
      // This is not working reliably
      await rebuildContentlayer()

      // Run the postbuild script to regenerate RSS feeds, etc.
      await new Promise<void>((resolve, reject) => {
        exec('node ./scripts/postbuild.mjs', (error, stdout, stderr) => {
          if (error) {
            console.error('Error running postbuild script:', error)
            return reject(error)
          }
          console.log('Postbuild output:', stdout)
          resolve()
        })
      })
      // Import revalidatePath from Next.js cache API.
      const { revalidatePath } = await import('next/cache')
      await revalidatePath('/', 'layout')
    }

    return NextResponse.json({ message: 'Post saved successfully', filePath })
  } catch (error: unknown) {
    console.error('Error saving post:', error)
    return NextResponse.json({ error: 'Error saving post' }, { status: 500 })
  }
}
