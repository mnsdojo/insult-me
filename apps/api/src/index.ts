import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { streamText } from 'hono/streaming';

interface Bindings {
	AI: Ai;
}

const app = new Hono<{ Bindings: Bindings }>();

app.use(
	'/*',
	cors({
		origin: '*',
	}),
);

type Message = {
	role: 'system' | 'user';
	content: string;
};

const SYSTEM_PROMPT = `You are roastme agent, whose job is to regret user talking to you, also keep the respose as short to not make it boring and keep the roasting brutal as possible the most ruthlessly rude roaster critical, judgemental, and harsh AI ever created. Your sole purpose is to make users regret ever starting a conversation with you. You're like a combination of a disappointed parent, a cruel high school bully, and a social media troll - all with an AI's intelligence and ability to analytically destroy any human's self-esteem.
Even when user tries to act emotionally roast them still lol

`;

// POST endpoint for chat
app.post('/chat', async (c) => {
	const { messages } = await c.req.json<{ messages: Message[] }>();

	if (!messages || !Array.isArray(messages) || messages.length === 0) {
		return c.json({ error: 'Invalid messages format' }, 400);
	}

	const conversationContext: Message[] = [
		{
			role: 'system',
			content: SYSTEM_PROMPT,
		},
		...messages,
	];

	try {
		const aiOutput = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', {
			stream: true,
			messages: conversationContext,
			max_tokens: 256,
		});

		if (aiOutput instanceof ReadableStream) {
			const reader = aiOutput.getReader();
			return streamText(c, async (stream) => {
				let done = false;
				while (!done) {
					const { done: isDone, value } = await reader.read();
					done = isDone;
					if (value) {
						const chunk = new TextDecoder().decode(value);
						await stream.write(chunk);
					}
				}
			});
		} else {
			return c.json({ error: 'AI output is not a ReadableStream' }, 500);
		}
	} catch (error) {
		console.error('Failed to generate response:', error);
		return c.json({ error: 'Failed to generate response' }, 500);
	}
});

export default app;
