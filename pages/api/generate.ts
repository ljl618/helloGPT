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
    req: Request
): Promise<Response> {
    
    // owner api key proxy open ai service
    if (req.method === 'POST') {
        const postData = (await req.json()) as {
            apiKey: string;
            messages: IMessage[];
        }
        // const apiKey = JSON.parse(req.body).apiKey || process.env.API_KEY;
        const options = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${postData.apiKey}`,
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
     
    } else {
        return new Response('Method Not Allowed', { status: 405 });
    }
}
