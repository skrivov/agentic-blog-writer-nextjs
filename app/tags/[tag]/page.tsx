// app/tags/[tag]/page.tsx
import { slug } from 'github-slugger'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { promises as fs } from 'fs'
import path from 'path'
import { genPageMetadata } from 'app/seo'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

const POSTS_PER_PAGE = 5

export async function generateMetadata(props: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const params = await props.params
  const tag = decodeURI(params.tag)
  return genPageMetadata({
    title: tag,
    description: `${siteMetadata.title} ${tag} tagged content`,
    alternates: {
      canonical: './',
      types: {
        'application/rss+xml': `${siteMetadata.siteUrl}/tags/${tag}/feed.xml`,
      },
    },
  })
}

export const generateStaticParams = async () => {
  // If you have a tag-data.json file that’s updated, you can import it
  const tagData = await import('app/tag-data.json')
  const tagCounts = tagData.default || tagData
  const tagKeys = Object.keys(tagCounts)
  return tagKeys.map((tag) => ({
    tag: encodeURI(tag),
  }))
}

// Force dynamic rendering so the JSON is re-read on every request.
export const dynamic = 'force-dynamic'

export default async function TagPage(props: { params: Promise<{ tag: string }> }) {
  const params = await props.params
  const tagParam = decodeURI(params.tag)
  const title = tagParam[0].toUpperCase() + tagParam.slice(1)
  const pageNumber = 1

  // Read the latest blog posts JSON from disk
  const blogFilePath = path.join(process.cwd(), '.contentlayer', 'generated', 'Blog', '_index.json')
  const fileContents = await fs.readFile(blogFilePath, 'utf8')
  const allBlogs = JSON.parse(fileContents) as any[]

  // Filter posts by tag using github-slugger to normalize tag names
  const filteredPosts = allCoreContent(
    sortPosts(
      allBlogs.filter(
        (post) => post.tags && post.tags.map((t: string) => slug(t)).includes(tagParam)
      )
    )
  ) as any

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  if (pageNumber <= 0 || pageNumber > totalPages || isNaN(pageNumber)) {
    return notFound()
  }
  const initialDisplayPosts = filteredPosts.slice(0, POSTS_PER_PAGE)
  const pagination = {
    currentPage: pageNumber,
    totalPages,
  }

  return (
    <ListLayout
      posts={filteredPosts as any}
      initialDisplayPosts={initialDisplayPosts as any}
      pagination={pagination}
      title={title}
    />
  )
}
