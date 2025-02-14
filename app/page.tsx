//app/page.tsx
import { promises as fs } from 'fs'
import path from 'path'
import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import Main from './Main'

// Optionally force dynamic rendering:
export const dynamic = 'force-dynamic'

export default async function Page() {
  // Construct the path to the JSON file
  const filePath = path.join(process.cwd(), '.contentlayer', 'generated', 'Blog', '_index.json')

  // Read and parse the JSON file
  const fileContents = await fs.readFile(filePath, 'utf8')
  const allBlogs = JSON.parse(fileContents)

  // Process the blogs as before
  const sortedPosts = sortPosts(allBlogs)
  const posts = allCoreContent(sortedPosts)

  return <Main posts={posts} />
}
