import { Hono } from 'hono';
import { cors } from 'hono/cors';

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
app.post('/api', async (c) => {
	const { messages } = await c.req.json<{ messages: Message[] }>();

	if (!messages || !Array.isArray(messages) || messages.length === 0) {
		return c.json({ error: 'Invalid messages format' }, 400);
	}

	try {
		const chatStream = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', {
			stream: true,
			messages: messages,
			max_tokens: 256,
		});
	} catch (error) {
		return c.json({ error: 'Failed to generate response' }, 500);
	}
});

export default app;
