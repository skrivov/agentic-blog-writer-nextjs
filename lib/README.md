
# Technical Notes

## Features of Agentic Blog Writer 

- Leverages LLMs to generate new blog posts  
- Modular, pluggable LLM workflows  
- Workflow examples using [LangChain.js](https://js.langchain.com/docs/introduction/)  
- Agentic Workflow examples using [LangGraph.js](https://langchain-ai.github.io/langgraphjs/#langgraph-platform) 
- Built on top of  [Tailwind Next.js Starter Blog](https://github.com/timlrx/tailwind-nextjs-starter-blog).
- Currently, four workflows are implemented: Basic, Chain of Thought, Writer-Critic, and Deep Research

## My Code

The code for Agentic Blog Writer is located in the following folders:
- `lib`
- `app/editor`
- `app/api/ai`
- `app/api/post`

~~I have intentionally kept my code cleanly separated from the base app's code. The only significant change from the Tailwind Next.js Starter Blog is the replacement of the `summary` field with the `description` field.~~
The pages for `app`, `app/blog`, and `app/blog/[...slug]` have been modified to ensure that the app sees newly created content in production mode.


## My Key Design Decisions  

### Future-Ready Development  
I wanted to build something potentially useful in the long run, so I decided to develop an AI-powered blog generator based on a popular GitHub project.  

### Markdown as the Core  
In the world of blog and documentation writing, Markdown is king. Many popular tools, like Gatsby, rely on it. I chose a Markdown-based solution, which is widely used by technical bloggers.  

### Markdown Processing Focus  
I knew that a significant portion of the development effort would go into processing Markdown—and that was exactly the case. However, the payoff was a clean, feature-rich blog editor with syntax-highlighted code blocks. For instance, I integrated **Rehype Prism Plus**, a plugin for the *rehype* library that enables code block highlighting in HTML.  


### Pluggable Workflow Design  
To make my project a useful platform for testing LLM workflows, I implemented a modular workflow system. Adding a new workflow is straightforward:  

1. Create a new directory in `lib/workflows` with two files: `index.ts` and `prompts.ts`.  
2. Register the new workflow in `workflowsConfig.ts` and `workflowsMetadata.ts`.  

I separated these files because one is used in the UI, while the other cannot be imported into UI code.  

### Separation of Prompts from Code  
Following best practices, I kept versioned prompts in separate files to ensure maintainability.  

### Reusing Common Prompts  
I factored out reusable prompt fragments, storing them in `lib/prompts` for consistency across workflows. 


## My Approach to Prompt Engineering

- **Stay Updated:**  
  Follow AI news and research publications to stay informed about the latest prompt engineering techniques, such as few-shot learning, chain of thought, reflection, and self-discovery.

- **Learn from the Best:**  
  Study high-quality examples, such as those from LangChain Hub.

- **Be Explicit:**  
  Use clear and precise instructions. For example, if you want to exclude a description field, specify:  
  `Output YAML front matter containing only the following keys: title, date, tags, draft, and description. Do not include any other keys.`

- **Use Examples and Negative Examples:**  
  Provide correct examples and explicitly highlight what should be avoided.

- **Adapt to LLM Behavior:**  
  Instead of forcing the LLM to use a specific term (e.g., replacing meta description with summary), consider adapting to its natural flow. For instance, I had to modify document formatting in my blog writer to replace summary with description for better compatibility.

- **Separate Prompts from Code:**  
  In larger projects, maintain a clear strategy for storing and modifying prompts. Keep them separate from the code to improve maintainability.

- **Factor Out Common Prompts:**  
  Reuse common prompts across workflows. For example, I have a Markdown formatting prompt that I use in multiple workflows, stored separately in `lib/prompts/mdxFormatting.ts`.

- **Iterative Testing:**  
  Experiment with multiple prompt variations and test them against edge cases to determine which consistently produces the desired output. This approach can be enhanced with advanced techniques such as agent-based simulation.

## Handling Edge Cases

**Protection from Human Prompting Errors:**  
Humans may provide vague, ambiguous, or self-contradictory input. The best practice in leading LLMs, such as `o3-mini`, is to include an additional stage that analyzes user input and reformulates it concisely. My implementation in `lib/workflows/chainOfThoughts` is a simplified version of this approach.

**Iterative Testing:**  
Experiment with multiple prompt variations and test them against edge cases to determine which consistently produces the desired output. LLMs can be unpredictable, sometimes varying output formats unexpectedly. For example, my previously well-functioning `AiOutputPreview` occasionally broke due to the LLM inconsistently wrapping Markdown code in triple backticks.

**Explicit Instructions:**  
Use clear and precise instructions. For example, if a description field is not needed, specify:  
`Output YAML front matter containing only the following keys: title, date, tags, draft, and summary. Do not include any other keys.`

**Examples and Negative Examples:**  
Provide correct examples and explicitly highlight what should be avoided.

**Post-Processing:**  
If the model output still contains unwanted fields, implement a post-processing step to clean the front matter before saving it. For instance, in some cases, the LLM outputs text wrapped in triple backticks (e.g., ```mdx), which breaks the preview. To resolve this, I added logic to remove triple backticks if detected.


## Quick Start Guide

1. Clone the repo

```bash
git clone https://github.com/skrivov/agentic-blog-writer-nextjs.git
```


## Installation

```bash
yarn install
```

Please note, that if you are using Windows, you may need to run:

```bash
$env:PWD = $(Get-Location).Path
```
## API Keys  
You will need one or two API keys in a `.env` or `.env.local` file. 
  

```env
### Required Agentic Blog Writer Keys:
OPENAI_API_KEY="your_openai_api_key"
# If you do not use the Deep Research workflow, provide any value for TAVILY_API_KEY
TAVILY_API_KEY="your_tavily_api_key"
```

## Development

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

Agentic Blog Writer saves files on server filesystem. Apps that perform filesystem writes cannot be deployed on Vercel or Netlify without elaborate workarounds; AWS is the recommended platform for such applications.
