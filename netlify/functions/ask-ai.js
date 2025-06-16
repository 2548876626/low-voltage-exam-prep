// netlify/functions/ask-ai.js
const fetch = require('node-fetch'); 

exports.handler = async function(event, context) {
    // 只接受 POST 请求
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // 从前端发送过来的请求中解析出内容
        const { prompt } = JSON.parse(event.body);
        
        // 这是你的 API Key，从 Netlify 的环境变量中获取
        const apiKey = process.env.DEEPSEEK_API_KEY;

        const response = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-r1-0528:free", // 使用官方推荐的稳定模型名
                messages: [
                    { "role": "system", "content": "你是一个严格的低压电工实操考官。请根据用户提供的考试要点，一次只提出一个相关的问题。问题要简明扼셔，直接切入要点。" },
                    { "role": "user", "content": prompt }
                ],
                max_tokens: 100, // 限制回答长度，避免过长
                temperature: 0.5, // 让回答更具确定性
                stream: false
            })
        });

        if (!response.ok) {
            // 如果 API 返回错误，则抛出错误
            const errorData = await response.json();
            throw new Error(errorData.error.message || `API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        // 将 AI 的回答返回给前端
        return {
            statusCode: 200,
            body: JSON.stringify({ response: aiResponse })
        };

    } catch (error) {
        // 捕获任何错误，并返回给前端
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};