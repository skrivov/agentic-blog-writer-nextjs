
# Technical Notes

## Features of Agentic Blog Writer 

- Leverages LLMs to generate new blog posts  
- Modular, pluggable LLM workflows  
- Workflow examples using [LangChain.js](https://js.langchain.com/docs/introduction/)  
- Agentic Workflow examples using [LangGraph.js](https://langchain-ai.github.io/langgraphjs/#langgraph-platform) 
- Built on top of  [Tailwind Next.js Starter Blog](https://github.com/timlrx/tailwind-nextjs-starter-blog).
- Currently, four workflows are implemented: Basic, Chain of Thought, Writer-Critic, and Deep Research

## TODO:
~~- Fix rendering of the Tags page in production mode.~~
- Display a spinning wheel after the "Publish" button is pressed to indicate that the file is in the process of being saved.
- Add admin login with the password stored in the `.env` file, and make the AiEditor invisible to users who are not logged in.




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

# Workbench: A/B Testing Framework CONCEPT

This library provides a flexible framework for running A/B tests on LLM-generated blog posts. Our goal is to compare different workflows (e.g., _basic_, _chainOfThoughts_, _writerCritic_, _deepResearch_) on a range of user prompts and then evaluate their outputs using custom judges.

## 1. Evaluation Criteria for LLM-Generated Blog Posts

When using a large language model (LLM) to produce blog content, several quality criteria determine how good the output is. Key aspects include:

- **Coherence and Fluency:**  
  The text should flow logically and read naturally, with no contradictions or disjointed sections. High fluency and logical coherence are fundamental for readability.

- **Factual Accuracy (Groundedness):**  
  Content must be truthful and based on verifiable facts. LLMs can hallucinate details, so ensuring the output is fact-checked against reliable sources is critical.  
  *Example:* A blog about _Nutriharvest Organic Fertilizer_ must be verified for its claims.

- **Engagement and Readability:**  
  The writing should be engaging with clear grammar and an appropriate reading level. If content is too dense or off-topic, readers may quickly bounce.

- **SEO Effectiveness:**  
  The post should be optimized for search engines—using relevant keywords, clear headings, and proper meta descriptions to improve organic reach.

- **Originality:**  
  The content must be novel and avoid plagiarism. While LLMs are trained on vast data, a unique perspective is crucial for SEO and user trust.

- **Relevance and Intent Alignment:**  
  The post should address the intended topic or query. Drift or misalignment can reduce effectiveness.

- **Tone and Style Consistency:**  
  Maintaining a consistent tone that aligns with the brand’s voice is essential. For instance, an educational blog should be friendly yet authoritativ.

In summary, a good LLM-generated blog post is **coherent, accurate, engaging, readable, SEO-optimized, original, and on-target** in relevance and tone.

## 2. Challenges with Modern Tools

Modern evaluation tools such as [braintrust.dev](https://www.braintrust.dev/) offer powerful functionality for testing LLM outputs. However, they fall short in several areas when it comes to A/B testing blog posts:

- **Limited Factuality Evaluation:**  
  Tools like Braintrust are excellent for short-form Q&A or summarization tasks but often lack robust mechanisms for fact-checking long-form content. They rely on internal scoring rather than verifying claims against up-to-date external data.

- **Rigid Evaluation Criteria:**  
  Many existing systems use fixed heuristics that may not capture nuances like engagement or SEO performance, making them less adaptable to the diverse requirements of blog content.

- **Scalability and Flexibility:**  
  While Braintrust provides an evaluation framework, integrating multiple custom judges (e.g., for factuality, relevance, tone) requires additional development. 
  
  Our workbench is designed to address these gaps with a modular, extensible approach.

## 3. Example: Evaluating Factuality

Evaluating the factual accuracy of an LLM-generated blog post is a multifaceted challenge:

- **Hallucinations:**  
  LLMs can generate plausible-sounding but incorrect details that lack grounding in reality.

- **Partial Correctness:**  
  A blog post might interweave factual statements with creative or speculative content, making overall accuracy hard to gauge.

- **Complexity of Verification:**  
  Verifying factual claims is inherently complex—it often requires performing real-time internet searches (using tools like the **TavilySearchAPIRetriever**) to gather current, credible data for validation.

- **Intent Matters:**  
  Not every blog is meant to be strictly factual. When a user's prompt implies a fictional, satirical, or imaginative narrative, rigorous fact-checking becomes unnecessary. In such cases, our system can intelligently bypass external verification.

Our framework addresses these challenges by first identifying verifiable claims and then querying external sources to assess each claim’s validity, while also respecting the user’s intent regarding factuality.

## 4. Our Approach to Evaluating Factuality

Our fact-checking strategy is built on a modular, two-step process:

1. **Claim Extraction:**  
   The system extracts potential factual claims from the blog post using a structured prompt. This step isolates statements that can be verified from those that are purely creative or opinion-based.

2. **Claim Verification via External Search:**  
   For each claim deemed verifiable, the system performs an external search using the **TavilySearchAPIRetriever**. The aggregated search results (including titles and content) are then combined with the original claim and sent to an LLM configured with structured output. This LLM evaluates whether the claim is:
   - **True:** Supported by credible and up-to-date sources.
   - **False:** Contradicted by the external evidence.
   - **Uncertain:** Lacking sufficient evidence for a definitive conclusion.

This comprehensive approach grounds fact-checking in real-world data and provides detailed explanations and source references for each claim. Additionally, by employing an LLM to assess the overall intent of the blog, our framework intelligently determines when fact-checking is applicable—ensuring that creative or non-factual content is not inappropriately penalized.

## 5. lib/workbench Architecture

The **lib/workbench** directory is designed with flexibility and extensibility in mind:

- **Workflows:**  
  Defined in `lib/workflowsConfig.ts`, these are your different blog-generation strategies.

- **Judges:**  
  Located under `lib/workbench/judges/`, each judge (e.g., `relevanceChecker`, `factChecker`) is a self-contained module with:
  - A **schema** (`schema.ts`) to enforce structured outputs.
  - **Prompt templates** (`prompts.ts`) to guide the evaluation.
  - An **implementation** (`index.ts`) that uses LangGraph to create a modular evaluation pipeline.

- **A/B Testing Script:**  
  The script `lib/ab-test-workflows.ts` coordinates workflow execution and judge evaluation. It accepts as input two workflows, one or more judges, and a test file (e.g., `workbench/tests/test1.json`). For each test prompt, it runs the workflows, applies the judges, and dumps a JSON summary (e.g., `workbench/tests/output1.json`).

## 6. Extensibility

Our workbench is built to be **highly extendable**:

- **Adding New Workflows:**  
  New workflows can be added to your system simply by creating a new module (e.g., in `lib/workflows/`) and registering it in `lib/workflowsConfig.ts`. This allows you to experiment with different LLM prompts, chain-of-thought strategies, or any other workflow designs without altering the evaluation framework.

- **Adding New Judges:**  
  Similarly, new judges can be developed by creating a dedicated folder under `lib/workbench/judges/` (e.g., `sentimentChecker`, `styleEvaluator`, etc.), and then registering them in `lib/judgesConfig.ts`. Each judge is self-contained with its own schema and prompts, making it easy to extend the evaluation criteria as needed.

This modular architecture ensures that as new challenges or evaluation criteria arise, you can seamlessly integrate additional workflows or judges into the system.

## 7. Configuration & Running the A/B Testing

### Configuration:
- **Workflows:**  
  Configure your workflows in `lib/workflowsConfig.ts`.

- **Judges:**  
  Register your judges in `lib/judgesConfig.ts` (e.g., `relevance`, `fact`, etc.).

- **Tests:**  
  Place your test prompts in a JSON file under `workbench/tests/` (e.g., `test1.json`).

### Running the A/B Test:
Use `ts-node` to run the A/B testing script. For example:
```bash
ts-node lib/ab-test-workflows.ts --workflow1=basic --workflow2=deepResearch --judges=relevance,fact --testFile=workbench/tests/test1.json --outputFile=workbench/tests/output1.json
```

This command will:

- Generate blog posts using the specified workflows.
- Run each selected judge on the outputs.
- Save a JSON report with results and evaluations.
