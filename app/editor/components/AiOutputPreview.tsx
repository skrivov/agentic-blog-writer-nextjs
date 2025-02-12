// File: /app/editor/AiOutputPreview.tsx
'use client'

import React from 'react'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { components as defaultMDXComponents } from '@/components/MDXComponents'

interface AiOutputPreviewProps {
  mdx: MDXRemoteSerializeResult | null
}

export default function AiOutputPreview({ mdx }: AiOutputPreviewProps) {
  // Check if the mdx prop exists and has the necessary compiledSource property.
  if (!mdx || !('compiledSource' in mdx)) {
    return <div className="p-4 text-gray-600">No blog content found.</div>
  }

  // Merge in frontmatter if it doesn’t exist.
  const effectiveMDX = { ...mdx, frontmatter: mdx.frontmatter || {} };

  const hasFrontmatter =
    effectiveMDX.frontmatter &&
    Object.keys(effectiveMDX.frontmatter).length > 0;

  return (
    <div className="prose dark:prose-invert p-4">
      {hasFrontmatter && (
        <Disclosure>
          {({ open }) => (
            <div className="mb-6">
              <DisclosureButton className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-gray-900 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75 dark:text-gray-100 dark:bg-gray-800">
                <span>Front Matter</span>
                <span>{open ? 'Hide' : 'Show'}</span>
              </DisclosureButton>
              <DisclosurePanel className="px-4 pt-4 pb-2 text-sm text-gray-500 dark:text-gray-300">
                <form className="space-y-2">
                  {Object.entries(effectiveMDX.frontmatter).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                        {key}
                      </label>
                      <input
                        type="text"
                        value={String(value)}
                        readOnly
                        className="w-full rounded border border-gray-300 p-1 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                      />
                    </div>
                  ))}
                </form>
              </DisclosurePanel>
            </div>
          )}
        </Disclosure>
      )}
      <MDXRemote {...effectiveMDX} components={defaultMDXComponents} />
    </div>
  );
}