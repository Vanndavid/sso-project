import { json, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const allowedOrigins = new Set([
	'http://localhost:5001',
	'http://localhost:5002',
	'http://localhost:5003'
]);

function corsHeaders(request: Request): Record<string, string> {
	const origin = request.headers.get('origin');

	if (!origin || !allowedOrigins.has(origin)) {
		return {};
	}

	return {
		'Access-Control-Allow-Origin': origin,
		'Access-Control-Allow-Credentials': 'true',
		Vary: 'Origin'
	};
}

export const OPTIONS: RequestHandler = async (event) => {
	return text('', {
		status: 204,
		headers: {
			...corsHeaders(event.request),
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type'
		}
	});
};

export const GET: RequestHandler = async (event) => {
	const session = await event.locals.auth();

	return json(
		{
			authenticated: Boolean(session?.user),
			user: session?.user ?? null
		},
		{
			headers: corsHeaders(event.request)
		}
	);
};