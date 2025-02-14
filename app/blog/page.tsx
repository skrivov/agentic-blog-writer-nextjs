import { promises as fs } from 'fs'
import path from 'path'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { genPageMetadata } from 'app/seo'
import ListLayout from '@/layouts/ListLayoutWithTags'

const POSTS_PER_PAGE = 5

export const metadata = genPageMetadata({ title: 'Blog' })
export const dynamic = 'force-dynamic'

export default async function BlogPage(props: { searchParams: Promise<{ page: string }> }) {
  // Construct the path to the generated JSON file for blogs
  const filePath = path.join(process.cwd(), '.contentlayer', 'generated', 'Blog', '_index.json')

  // Read and parse the JSON file
  const fileContents = await fs.readFile(filePath, 'utf8')
  const allBlogs = JSON.parse(fileContents) as any // quick and dirty cast

  // Process the blogs as before
  const sortedPosts = sortPosts(allBlogs) as any
  const posts = allCoreContent(sortedPosts) as any

  const pageNumber = 1
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)
  const initialDisplayPosts = posts.slice(0, POSTS_PER_PAGE * pageNumber)
  const pagination = {
    currentPage: pageNumber,
    totalPages: totalPages,
  }

  return (
    <ListLayout
      posts={posts as any}
      initialDisplayPosts={initialDisplayPosts as any}
      pagination={pagination}
      title="All Posts"
    />
  )
}
