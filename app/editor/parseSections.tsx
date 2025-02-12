/**
 * In a real app, you'd parse the MDX frontmatter, headings up to h4, etc.
 * For demonstration, we return some static sections.
 */
export function parseSectionsFromRawMdx(rawMdx: string = '') {
    return [
        {
            id: 'sec1',
            heading: 'Introduction',
            content: 'Lorem ipsum introduction...\nMore lines...\n[User Prompt was: ' + rawMdx.slice(0, 30) + '...]',
        },
        {
            id: 'sec2',
            heading: 'Details',
            content: 'Details about subtopic. Possibly code blocks, images, etc...',
        },
        {
            id: 'sec3',
            heading: 'Conclusion',
            content: 'Final summary paragraphs here...',
        },
    ]
}
