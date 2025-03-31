import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import * as dotenv from 'dotenv';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

// Tools: can simply do what your llm cannot not do, like fetching data, querying your database etc.
dotenv.config();
// Replace with Google Gemini


// Create a tool that simulate weather fetching
const weatherTool = tool(async ({ query }) => {
    console.log("Query is ", query)
    // Implement the weather tool by fetching from an actual api
    return 'The weather in Douala is rainy'
},
    {
        name: "weather",
        description: "Get the weather of the current location",
        // schema is how we tell llms like claude to use this tool 
        schema: z.object({ query: z.string().describe("The query to use in search and best footballer from that city") })
    })



const model = new ChatGoogleGenerativeAI({
    model: 'gemini-2.0-flash', // Use the appropriate Gemini model
    apiKey: process.env.GOOGLE_API_KEY, // You'll need a Google API key
});

const agent = createReactAgent({
    llm: model,
    tools: [weatherTool],
});

// Use the agent
const result = await agent.invoke({
    messages: [
        {
            role: 'user',
            content: 'What is the weather in Douala?',
        },
    ],
});

console.log(result)

console.log(result.messages.at(-1)?.content);