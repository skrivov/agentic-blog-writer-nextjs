// File: /app/editor/AiEditor.tsx
'use client'

import React from 'react'
import AiOutputPreview from './components/AiOutputPreview'
import PromptArea from './components/PromptArea'
import WorkflowButtons from './components/WorkflowButtons'
import ProcessingModal from './components/ProcessingModal'

interface AiEditorProps {
    mdx: any; // MDXRemoteSerializeResult or null
    prompt: string;
    onPromptChange: (value: string) => void;
    onSubmit: () => void;
    onSave: () => void;
    onClear: () => void;
    isLoading: boolean;
    workflowButtons: { key: string; title: string }[];
    selectedWorkflow: string;
    workflowTitle: string;
    onSelectWorkflow: (workflowKey: string) => void;
    promptLabel: string;  // New prop for prompt label text
}

export default function AiEditor({
    mdx,
    prompt,
    onPromptChange,
    onSubmit,
    onSave,
    onClear,
    isLoading,
    workflowButtons,
    selectedWorkflow,
    workflowTitle,
    onSelectWorkflow,
    promptLabel,
}: AiEditorProps) {
    // onKeyDown handler for the prompt area.
    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
        }
    }

    // Extract the blog title from MDX frontmatter if available.
    const blogTitle = mdx?.frontmatter?.title || 'Blog Preview';

    return (
        <div className="min-h-screen flex flex-col">
            {/* Render the processing modal when LLM is working */}
            {isLoading && (
                <ProcessingModal workflowTitle={workflowTitle} prompt={prompt} />
            )}

            {/* Top Bar: Render only if MDX content exists (revision state) */}
            {mdx && (
                <div className="p-4 flex justify-between items-center border-b">
                    <h2 className="text-lg font-bold">{blogTitle}</h2>
                    {/* Button group: Clear and Publish remain together */}
                    <div className="flex space-x-2">
                        <button
                            onClick={onClear}
                            disabled={isLoading}
                            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-60"
                        >
                            Clear
                        </button>
                        <button
                            onClick={onSave}
                            disabled={isLoading}
                            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-60"
                        >
                            Publish
                        </button>
                    </div>
                </div>
            )}

            {/* MDX Preview Panel: Render only when MDX content exists */}
            {mdx && <AiOutputPreview mdx={mdx} />}

            {/* Prompt & Workflow Section */}
            <div className="p-4 border-t space-y-4">
                <WorkflowButtons
                    workflows={workflowButtons}
                    selectedWorkflow={selectedWorkflow}
                    onSelectWorkflow={onSelectWorkflow}
                    isLoading={isLoading}
                />
                <PromptArea
                    label={promptLabel}  // Pass the label down
                    prompt={prompt}
                    onPromptChange={onPromptChange}
                    onSubmit={onSubmit}
                    onKeyDown={handleKeyDown}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}
