import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

// Replace with Google Gemini
const model = new ChatGoogleGenerativeAI({
    model: 'gemini-2.0-flash', // Use the appropriate Gemini model
    // apiKey: 'AIzaSyC1KCluFoXHGcF9Q_mJgMtN136r2Xt8lP8', // You'll need a Google API key
});

const agent = createReactAgent({
    llm: model,
    tools: [],
});

// Use the agent
const result = await agent.invoke({
    messages: [
        {
            role: 'user',
            content: 'Hello, how can you help me?',
        },
    ],
});

console.log(result)

console.log(result.messages.at(-1)?.content);