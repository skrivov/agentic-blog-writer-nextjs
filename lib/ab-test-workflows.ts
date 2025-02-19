// File: lib/ab-test-workflows.ts

import { promises as fs } from "fs";
import path from "path";
import { workflows } from "./workflowsConfig";
import { judges } from "./judgesConfig";

interface ABTestResult {
    prompt: string;
    workflowResults: Record<string, string>;
    evaluations: Record<string, Record<string, any>>;
}

async function main() {
    // Parse command line arguments.
    // Example usage:
    // ts-node lib/ab-test-workflows.ts --workflow1=basic --workflow2=deepResearch --judges=relevance,fact --testFile=workbench/tests/test1.json --outputFile=workbench/tests/output1.json
    const args = process.argv.slice(2);
    const argObj = args.reduce((acc, arg) => {
        const [key, value] = arg.replace(/^--/, "").split("=");
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>);

    const workflow1Key = argObj.workflow1;
    const workflow2Key = argObj.workflow2;
    const judgeKeys = argObj.judges ? argObj.judges.split(",") : [];
    const testFilePath = argObj.testFile;
    const outputFilePath = argObj.outputFile;

    if (!workflow1Key || !workflow2Key || judgeKeys.length === 0 || !testFilePath || !outputFilePath) {
        console.error("Missing required arguments: workflow1, workflow2, judges, testFile, outputFile");
        process.exit(1);
    }

    // Find the two workflow definitions.
    const workflow1 = workflows.find((w) => w.key === workflow1Key);
    const workflow2 = workflows.find((w) => w.key === workflow2Key);
    if (!workflow1 || !workflow2) {
        console.error("One or both workflows not found.");
        process.exit(1);
    }

    // Select the judges that match the provided keys.
    const selectedJudges = judges.filter((j) => judgeKeys.includes(j.key));
    if (selectedJudges.length === 0) {
        console.error("No valid judges found.");
        process.exit(1);
    }

    // Read the tests file.
    const testsRaw = await fs.readFile(path.resolve(testFilePath), "utf8");
    const testPrompts: string[] = JSON.parse(testsRaw);

    const results: ABTestResult[] = [];

    // Process each test prompt.
    for (const prompt of testPrompts) {
        console.log(`Processing prompt: ${prompt}`);

        // Generate blog posts using the two workflows.
        const output1 = await workflow1.handler({ prompt, rawMdx: undefined });
        const output2 = await workflow2.handler({ prompt, rawMdx: undefined });

        // For each judge, run evaluation on both outputs.
        const evaluations: Record<string, Record<string, any>> = {};
        for (const judge of selectedJudges) {
            const eval1 = await judge.handler({ topic: prompt, generatedContent: output1 });
            const eval2 = await judge.handler({ topic: prompt, generatedContent: output2 });
            evaluations[judge.key] = {
                [workflow1Key]: eval1,
                [workflow2Key]: eval2,
            };
        }

        results.push({
            prompt,
            workflowResults: {
                [workflow1Key]: output1,
                [workflow2Key]: output2,
            },
            evaluations,
        });
    }

    // Write results to the specified output JSON file.
    await fs.writeFile(path.resolve(outputFilePath), JSON.stringify(results, null, 2), "utf8");
    console.log(`A/B test results written to ${outputFilePath}`);
}

main().catch((err) => {
    console.error("Error running A/B testing script:", err);
    process.exit(1);
});
