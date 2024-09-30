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

// Define the message type
type Message = {
	role: 'system' | 'user';
	content: string;
};

// POST endpoint for chat
app.post('/chat', async (c) => {
	const { messages } = await c.req.json<{ messages: Message[] }>();

	if (!messages || !Array.isArray(messages) || messages.length === 0) {
		return c.json({ error: 'Invalid messages format' }, 400);
	}

	const conversationContext: Message[] = [
		{
			role: 'system',
			content: "You are a troll insulting agent whose job is to insult on every message, don't spare anyone haha ok",
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
						await stream.sleep(10);
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

// GET endpoint to test streaming AI response
app.get('/test-stream', async (c) => {
	const conversationContext: Message[] = [
		{
			role: 'system',
			content: "You are a troll insulting agent whose job is to insult on every message, don't spare anyone haha ok",
		},
		{
			role: 'user',
			content: 'Tell me something funny!',
		},
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
						await stream.sleep(10);
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

// Additional example endpoints can go here

export default app;
