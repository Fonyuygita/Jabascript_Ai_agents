import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import * as dotenv from 'dotenv';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { MemorySaver } from '@langchain/langgraph';

// Tools: can simply do what your llm cannot not do, like fetching data, querying your database etc.
dotenv.config();
// Replace with Google Gemini


// Create a tool that simulate weather fetching
const weatherTool = tool(async ({ query }) => {
    console.log("Query is ", query)
    // Implement the weather tool by fetching from an actual api
    return 'The weather in London is rainy'
},
    {
        name: "weather",
        description: "The query to use in your search. and flexible to answer user queries",
        // schema is how we tell llms like claude to use this tool
        schema: z.object({ query: z.string().describe("The query to use in search ") })
    })



// overwrite: the console.log in js, in js everything is possible
async function evalAndCaptureOutput(code) {
    const oldLog = console.log;
    const oldError = console.error;

    const output = [];
    let errorOutput = [];

    console.log = (...args) => output.push(args.join(' '));
    console.error = (...args) => errorOutput.push(args.join(' '));

    try {
        await eval(code);
    } catch (error) {
        errorOutput.push(error.message);
    }

    console.log = oldLog;
    console.error = oldError;

    return { stdout: output.join('\n'), stderr: errorOutput.join('\n') };
}


const jsExecutor = tool(
    async ({ code }) => {
        console.log('Running js code:', code);
        console.log("_____________________________________________");
        const result = await evalAndCaptureOutput(code);

        console.log("_____________________________________________");

        console.log("Result is ", result)

        return result;

    },
    {
        name: 'run_javascript_code_tool',
        description: `
      Run general purpose javascript code.
      This can be used to access Internet or do any computation that you need.
      The output will be composed of the stdout and stderr.
      The code should be written in a way that it can be executed with javascript eval in node environment.
    `,
        schema: z.object({
            code: z.string().describe('code to be executed'),
        }),
    }
);

// Initialize memory to persist state between graph runs
const checkpointSaver = new MemorySaver();

const model = new ChatGoogleGenerativeAI({
    model: 'gemini-2.0-flash', // Use the appropriate Gemini model
    apiKey: process.env.GOOGLE_API_KEY, // You'll need a Google API key
});

export const agent = createReactAgent({
    llm: model,
    tools: [weatherTool, jsExecutor],
    checkpointSaver, // <- Give the memory saver to our agent

});

// Use the agent
const result = await agent.invoke({
    messages: [
        {
            role: 'user',
            content: 'What is the weather in London?',
        },
    ],
},
    { configurable: { thread_id: 42 } }
);

const followUp = await agent.invoke({
    messages: [
        {
            role: 'user',
            content: 'What city have i mentioned above?',
        },
    ],
},
    { configurable: { thread_id: 42 } }
);

console.log(result)

console.log("Result content: ", result.messages.at(-1)?.content);
console.log("Follow up Content is: ", followUp.messages.at(-1)?.content);
