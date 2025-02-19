# Workbench A/B Testing Framework

This library provides a flexible framework for running A/B tests on LLM-generated blog posts. Our goal is to compare different workflows (e.g., _basic_, _chainOfThoughts_, _writerCritic_, _deepResearch_) on a range of user prompts and then evaluate their outputs using custom judges.

## 1. Evaluation Criteria for LLM-Generated Blog Posts

When using a large language model (LLM) to produce blog content, several quality criteria determine how good the output is. Key aspects include:

- **Coherence and Fluency:**  
  The text should flow logically and read naturally, with no contradictions or disjointed sections. High fluency and logical coherence are fundamental for readability ([learn.microsoft.com](https://learn.microsoft.com)).

- **Factual Accuracy (Groundedness):**  
  Content must be truthful and based on verifiable facts. LLMs can hallucinate details, so ensuring the output is fact-checked against reliable sources is critical ([learn.microsoft.com](https://learn.microsoft.com), [web.tapereal.com](https://web.tapereal.com)).  
  *Example:* A blog about _Nutriharvest Organic Fertilizer_ must be verified for its claims.

- **Engagement and Readability:**  
  The writing should be engaging with clear grammar and an appropriate reading level. If content is too dense or off-topic, readers may quickly bounce ([web.tapereal.com](https://web.tapereal.com)).

- **SEO Effectiveness:**  
  The post should be optimized for search engines—using relevant keywords, clear headings, and proper meta descriptions to improve organic reach ([web.tapereal.com](https://web.tapereal.com)).

- **Originality:**  
  The content must be novel and avoid plagiarism. While LLMs are trained on vast data, a unique perspective is crucial for SEO and user trust ([web.tapereal.com](https://web.tapereal.com)).

- **Relevance and Intent Alignment:**  
  The post should address the intended topic or query. Drift or misalignment can reduce effectiveness ([blog.uptrain.ai](https://blog.uptrain.ai)).

- **Tone and Style Consistency:**  
  Maintaining a consistent tone that aligns with the brand’s voice is essential. For instance, an educational blog should be friendly yet authoritative ([web.tapereal.com](https://web.tapereal.com)).

In summary, a good LLM-generated blog post is **coherent, accurate, engaging, readable, SEO-optimized, original, and on-target** in relevance and tone.

## 2. Challenges with Modern Tools

Modern evaluation tools such as [braintrust.dev](https://www.braintrust.dev/) offer powerful functionality for testing LLM outputs. However, they fall short in several areas when it comes to A/B testing blog posts:

- **Limited Factuality Evaluation:**  
  Tools like Braintrust are excellent for short-form Q&A or summarization tasks but often lack robust mechanisms for fact-checking long-form content. They rely on internal scoring rather than verifying claims against up-to-date external data.

- **Rigid Evaluation Criteria:**  
  Many existing systems use fixed heuristics that may not capture nuances like engagement or SEO performance, making them less adaptable to the diverse requirements of blog content.

- **Scalability and Flexibility:**  
  While Braintrust provides an evaluation framework, integrating multiple custom judges (e.g., for factuality, relevance, tone) requires additional development. Our workbench is designed to address these gaps with a modular, extensible approach.

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
