// app/tags/[tag]/page/[page]/page.tsx
import { slug } from 'github-slugger'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { notFound } from 'next/navigation'
import { promises as fs } from 'fs'
import path from 'path'

const POSTS_PER_PAGE = 5

// Force dynamic rendering so every request reads the latest data.
export const dynamic = 'force-dynamic'

// Generate static params based on live tag counts (computed from the latest JSON file)
export const generateStaticParams = async () => {
  const filePath = path.join(process.cwd(), '.contentlayer', 'generated', 'Blog', '_index.json')
  const fileContents = await fs.readFile(filePath, 'utf8')
  const allBlogs = JSON.parse(fileContents) as any[]

  // Dynamically compute tag counts from the latest blog posts
  const tagCounts: Record<string, number> = {}
  for (const post of allBlogs) {
    if (post.tags && Array.isArray(post.tags)) {
      for (const tag of post.tags) {
        const tagSlug = slug(tag)
        tagCounts[tagSlug] = (tagCounts[tagSlug] || 0) + 1
      }
    }
  }

  // Create static params for each tag and each page number
  return Object.keys(tagCounts).flatMap((tagKey) => {
    const count = tagCounts[tagKey]
    const totalPages = Math.max(1, Math.ceil(count / POSTS_PER_PAGE))
    return Array.from({ length: totalPages }, (_, i) => ({
      tag: encodeURI(tagKey),
      page: (i + 1).toString(),
    }))
  })
}

export default async function TagPage(props: { params: Promise<{ tag: string; page: string }> }) {
  const params = await props.params
  const tagParam = decodeURI(params.tag)
  const pageNumber = parseInt(params.page)

  // Read the latest blog posts from disk
  const filePath = path.join(process.cwd(), '.contentlayer', 'generated', 'Blog', '_index.json')
  const fileContents = await fs.readFile(filePath, 'utf8')
  const allBlogs = JSON.parse(fileContents) as any[]

  // Filter posts by tag (using github-slugger to normalize tag names)
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

  const initialDisplayPosts = filteredPosts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
  const pagination = { currentPage: pageNumber, totalPages }

  // Simple title: capitalize the first letter
  const title = tagParam[0].toUpperCase() + tagParam.slice(1)

  return (
    <ListLayout
      posts={filteredPosts as any}
      initialDisplayPosts={initialDisplayPosts as any}
      pagination={pagination}
      title={title}
    />
  )
}
