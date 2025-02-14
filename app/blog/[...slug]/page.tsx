import 'css/prism.css'
import 'katex/dist/katex.css'

import PageTitle from '@/components/PageTitle'
import { components } from '@/components/MDXComponents'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { sortPosts, coreContent, allCoreContent } from 'pliny/utils/contentlayer'
import PostSimple from '@/layouts/PostSimple'
import PostLayout from '@/layouts/PostLayout'
import PostBanner from '@/layouts/PostBanner'
import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { notFound } from 'next/navigation'
import { promises as fs } from 'fs'
import path from 'path'

const defaultLayout = 'PostLayout'
const layouts = {
  PostSimple,
  PostLayout,
  PostBanner,
}

// Force dynamic rendering so the latest JSON is read on every request.
export const dynamic = 'force-dynamic'

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata | undefined> {
  const params = await props.params
  const slug = decodeURI(params.slug.join('/'))

  // Read the blog JSON file from disk
  const blogFilePath = path.join(process.cwd(), '.contentlayer', 'generated', 'Blog', '_index.json')
  const blogContents = await fs.readFile(blogFilePath, 'utf8')
  const allBlogs = JSON.parse(blogContents) as any

  // Read the authors JSON file from disk
  const authorFilePath = path.join(
    process.cwd(),
    '.contentlayer',
    'generated',
    'Authors',
    '_index.json'
  )
  const authorContents = await fs.readFile(authorFilePath, 'utf8')
  const allAuthors = JSON.parse(authorContents) as any

  const post = allBlogs.find((p: any) => p.slug === slug)
  if (!post) {
    return
  }

  const authorList = post.authors || ['default']
  const authorDetails = authorList.map((author: string) => {
    const authorResults = allAuthors.find((p: any) => p.slug === author)
    return coreContent(authorResults)
  })

  const publishedAt = new Date(post.date).toISOString()
  const modifiedAt = new Date(post.lastmod || post.date).toISOString()
  const authors = authorDetails.map((author: any) => author.name)
  let imageList = [siteMetadata.socialBanner]
  if (post.images) {
    imageList = typeof post.images === 'string' ? [post.images] : post.images
  }
  const ogImages = imageList.map((img: string) => ({
    url: img.includes('http') ? img : siteMetadata.siteUrl + img,
  }))

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      siteName: siteMetadata.title,
      locale: 'en_US',
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      url: './',
      images: ogImages,
      authors: authors.length > 0 ? authors : [siteMetadata.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: imageList,
    },
  }
}

export const generateStaticParams = async () => {
  const blogFilePath = path.join(process.cwd(), '.contentlayer', 'generated', 'Blog', '_index.json')
  const blogContents = await fs.readFile(blogFilePath, 'utf8')
  const allBlogs = JSON.parse(blogContents) as any

  return allBlogs.map((p: any) => ({
    slug: p.slug.split('/').map((name: string) => decodeURI(name)),
  }))
}

export default async function Page(props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params
  const slug = decodeURI(params.slug.join('/'))

  // Read the blog JSON file from disk
  const blogFilePath = path.join(process.cwd(), '.contentlayer', 'generated', 'Blog', '_index.json')
  const blogContents = await fs.readFile(blogFilePath, 'utf8')
  const allBlogs = JSON.parse(blogContents) as any

  const sortedCoreContents = allCoreContent(sortPosts(allBlogs)) as any
  const postIndex = sortedCoreContents.findIndex((p: any) => p.slug === slug)
  if (postIndex === -1) {
    return notFound()
  }

  const prev = sortedCoreContents[postIndex + 1]
  const next = sortedCoreContents[postIndex - 1]
  const post = allBlogs.find((p: any) => p.slug === slug) as any

  // Read the authors JSON file from disk
  const authorFilePath = path.join(
    process.cwd(),
    '.contentlayer',
    'generated',
    'Authors',
    '_index.json'
  )
  const authorContents = await fs.readFile(authorFilePath, 'utf8')
  const allAuthors = JSON.parse(authorContents) as any

  const authorList = post.authors || ['default']
  const authorDetails = authorList.map((author: string) => {
    const authorResults = allAuthors.find((p: any) => p.slug === author)
    return coreContent(authorResults)
  })

  const mainContent = coreContent(post)
  const jsonLd = post.structuredData
  jsonLd['author'] = authorDetails.map((author: any) => ({
    '@type': 'Person',
    name: author.name,
  }))

  const Layout = layouts[post.layout || defaultLayout]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Layout content={mainContent} authorDetails={authorDetails} next={next} prev={prev}>
        <MDXLayoutRenderer code={post.body.code} components={components} toc={post.toc} />
      </Layout>
    </>
  )
}
