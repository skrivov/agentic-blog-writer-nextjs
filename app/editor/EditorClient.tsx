// File: /app/editor/EditorClient.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { workflowsMetadata } from '@/lib/workflowsMetadata'
import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import AiEditor from './AiEditor'
import matter from 'gray-matter'
import GithubSlugger from 'github-slugger'

export default function EditorClient() {
    const router = useRouter()

    const [selectedWorkflow, setSelectedWorkflow] = useState(workflowsMetadata[0].key)
    const [isLoading, setIsLoading] = useState(false)
    const [prompt, setPrompt] = useState('')
    const [rawMdx, setRawMdx] = useState<string>('')
    const [serializedMdx, setSerializedMdx] = useState<MDXRemoteSerializeResult | null>(null)

    // Determine if the blog has been generated (i.e. modification mode)
    const isRevision = serializedMdx !== null && rawMdx !== ''

    // Filter workflows based on applicability:
    // - In "new" state, show workflows with applicability "new" or "both".
    // - In "revision" state, show workflows with applicability "modification" or "both".
    const filteredWorkflows = workflowsMetadata.filter(wf =>
        isRevision
            ? wf.applicability === 'modification' || wf.applicability === 'both'
            : wf.applicability === 'new' || wf.applicability === 'both'
    )

    // Ensure the selected workflow remains valid when the filtered list changes.
    useEffect(() => {
        if (!filteredWorkflows.find(wf => wf.key === selectedWorkflow)) {
            if (filteredWorkflows.length > 0) {
                setSelectedWorkflow(filteredWorkflows[0].key)
            }
        }
    }, [selectedWorkflow, filteredWorkflows])

    // Compute the prompt label based on modification mode.
    const promptLabel = isRevision
        ? "Suggest improvements to your blog"
        : "Describe your Blog";

    async function handleSubmit() {
        setIsLoading(true)
        try {
            // If in revision mode, include rawMdx in the API payload.
            const payload: any = { workflowKey: selectedWorkflow, prompt };
            if (isRevision) {
                payload.rawMdx = rawMdx;
            }
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            setRawMdx(data.rawMdx);
            setSerializedMdx(data.mdx);
            // Clear the prompt after generating the blog
            setPrompt('');
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    function handleSave() {
        if (!rawMdx) {
            console.error('No MDX content to save.');
            return;
        }
        const parsed = matter(rawMdx);
        const title = parsed.data.title || 'untitled';
        const slugger = new GithubSlugger();
        const slug = slugger.slug(title);

        fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rawMdx, slug }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Save failed with status ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Post saved successfully:', data);
                router.push('/');
            })
            .catch(error => {
                console.error('Error saving post:', error);
            });
    }

    function handleClear() {
        setRawMdx('');
        setSerializedMdx(null);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }

    // Compute the selected workflow's title from metadata.
    const selectedWorkflowDetails = workflowsMetadata.find(wf => wf.key === selectedWorkflow);
    const workflowTitle = selectedWorkflowDetails ? selectedWorkflowDetails.title : '';

    return (
        <AiEditor
            mdx={serializedMdx}
            prompt={prompt}
            onPromptChange={setPrompt}
            onSubmit={handleSubmit}
            onSave={handleSave}
            onClear={handleClear}
            isLoading={isLoading}
            workflowButtons={filteredWorkflows.map((wf) => ({ key: wf.key, title: wf.title }))}
            selectedWorkflow={selectedWorkflow}
            workflowTitle={workflowTitle}
            onSelectWorkflow={setSelectedWorkflow}
            promptLabel={promptLabel}   
        />
    );
}
