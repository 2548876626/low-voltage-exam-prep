// netlify/functions/ask-ai.js

// 依然推荐使用 node-fetch 保证兼容性
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Now we expect a 'messages' array from the frontend
        const { messages } = JSON.parse(event.body);
        const openRouterApiKey = process.env.DEEPSEEK_API_KEY;

        if (!openRouterApiKey) {
            throw new Error("API Key not found.");
        }
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new Error("Invalid 'messages' payload.");
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${openRouterApiKey}`,
                "HTTP-Referer": "https://elaborate-jalebi-c42658.netlify.app", // Remember to replace this
                "X-Title": "Low Voltage Exam Prep"
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-chat",
                messages: messages, // Pass the entire conversation history
                max_tokens: 150,
                temperature: 0.5,
                stream: false
            })
        });

        const responseText = await response.text();
        if (!response.ok) {
            throw new Error(`API request failed: ${responseText}`);
        }
        
        const data = JSON.parse(responseText);
        const aiResponse = data.choices[0].message.content;

        return {
            statusCode: 200,
            body: JSON.stringify({ response: aiResponse })
        };

    } catch (error) {
        console.error("Function Error:", error); 
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: "An internal server error occurred.",
                details: error.message
            })
        };
    }
};