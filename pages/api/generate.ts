import { NextApiRequest, NextApiResponse } from 'next';

import { IMessage } from '../../interface';

import { parseOpenAIStream } from '../../utils';

// import fetch from 'node-fetch';

interface PostData {
    messages: Omit<IMessage, 'id'>;
}
export const config = {
    runtime: "edge",
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<Response> {
    
    // owner api key proxy open ai service
    if (req.method === 'POST') {
        const postData = JSON.parse(req.body) as PostData;
        const apiKey = JSON.parse(req.body).apiKey || process.env.API_KEY;
        const options = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            method: 'POST',
            timeout: 8000,
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: postData.messages,
                temperature: 0.7,
                stream: true,
            }),
        };
        const proxyRes = await fetch(
            `https://api.openai.com/v1/chat/completions`,
            options
        );

        return new Response(parseOpenAIStream(proxyRes));
        // try {
        //     const proxyRes = await fetch(
        //         `https://api.openai.com/v1/chat/completions`,
        //         options
        //     );
        //     if (!proxyRes.body) {
        //         res.status(500).json({ message: 'Internal Server Error' });
        //         return;
        //     }

        //     proxyRes.body.on('data', (chunk) => {
        //         // Real-time writing data into the response stream and sending it to the client.
        //         res.write(chunk);
        //     });

        //     proxyRes.body.on('end', () => {
        //         // Send an end signal to the client when the response stream ends.
        //         res.end();
        //     });
        // } catch (error) {
        //     res.status(500).json({ message: 'Internal Server Error' });
        // }
    } else {
        res.status(405).end();
        return new Response('Method Not Allowed', { status: 405 });
    }
}


// try {
//     const res = await fetch(`/api/chat_with_gpt_by_proxy`, {
//         method: 'POST',
//         body: JSON.stringify({
//             apiKey,
//             messages: messages.map((item) => ({
//                 role: item.role,
//                 content: item.content,
//             })),
//         }),
//         signal: controller.signal,
//     }).then(async (response) => {
//         if (!response.ok) {
//             const text = await response.text();
//             console.log('错误--', text, typeof text);
//             throw JSON.parse(text);
//         }
//         return response;
//     });
//     return new Response(parseOpenAIStream(res));
// } catch (error) {
//     throw error;
// }
