// netlify/functions/ask-ai.js

// 依然推荐使用 node-fetch 保证兼容性
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { prompt } = JSON.parse(event.body);
        
        // 你的 OpenRouter API Key，它依然从环境变量中获取
        // Key 的名字我们不用改，还是叫 DEEPSEEK_API_KEY，方便管理
        const openRouterApiKey = process.env.DEEPSEEK_API_KEY;

        if (!openRouterApiKey) {
            throw new Error("API Key not found. Please check Netlify environment variables.");
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", { // <--- 关键修改点 1: API Endpoint
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${openRouterApiKey}`, // <--- 认证头，格式正确
                "HTTP-Referer": "https://YOUR_SITE_NAME.netlify.app", // <--- 关键修改点 2: 加上 Referer
                "X-Title": "Low Voltage Exam Prep" // <--- (可选但推荐) 加上项目标题
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-chat", // <--- 关键修改点 3: OpenRouter 里的模型名
                messages: [
                    { "role": "system", "content": "你是一个严格的低压电工实操考官。请根据用户提供的考试要点，一次只提出一个相关的问题。问题要简明扼要，直接切入要点。" },
                    { "role": "user", "content": prompt }
                ],
                max_tokens: 100,
                temperature: 0.5,
                stream: false
            })
        });

        const responseText = await response.text();

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}: ${responseText}`);
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