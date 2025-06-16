// netlify/functions/ask-ai.js

// 如果你之前没有加node-fetch，现在加上它，以排除fetch兼容性问题
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { prompt } = JSON.parse(event.body);
        const apiKey = process.env.DEEPSEEK_API_KEY;

        // 检查 API Key 是否成功获取
        if (!apiKey) {
            throw new Error("API Key not found. Please check Netlify environment variables.");
        }

        const response = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-r1-0528:free", // 确认模型名称正确
                messages: [
                    { "role": "system", "content": "你是一个严格的低压电工实操考官。请根据用户提供的考试要点，一次只提出一个相关的问题。问题要简明扼要，直接切入要点。" },
                    { "role": "user", "content": prompt }
                ],
                max_tokens: 100,
                temperature: 0.5,
                stream: false
            })
        });

        const responseText = await response.text(); // 先以文本形式读取响应

        if (!response.ok) {
            // 如果API返回错误，将原始响应文本包含在错误信息中
            throw new Error(`API request failed with status ${response.status}: ${responseText}`);
        }
        
        const data = JSON.parse(responseText); // 再尝试解析为JSON
        const aiResponse = data.choices[0].message.content;

        return {
            statusCode: 200,
            body: JSON.stringify({ response: aiResponse })
        };

    } catch (error) {
        // 关键改动：打印完整的错误对象到日志中
        console.error("Function Error:", error); 

        // 返回一个更详细的错误信息给前端
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: "An internal server error occurred.",
                details: error.message // 将错误消息也返回
            })
        };
    }
};