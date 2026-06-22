import { json, text } from '@sveltejs/kit';
import { SignJWT } from 'jose';
import { env } from '$env/dynamic/private';
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
	const headers: Record<string, string> = {
		...corsHeaders(event.request),
		'Access-Control-Allow-Methods': 'GET, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization'
	};

	return text('', { status: 204, headers });
};

export const GET: RequestHandler = async (event) => {
	const session = await event.locals.auth();

	if (!session?.user) {
		return json(
			{ error: 'Unauthorized' },
			{ status: 401, headers: corsHeaders(event.request) }
		);
	}

	const secret = env.AUTH_SECRET;
	if (!secret) {
		return json(
			{ error: 'AUTH_SECRET is missing' },
			{ status: 500, headers: corsHeaders(event.request) }
		);
	}

	const userId = session.user.id;
	const email = session.user.email ?? '';
	const role = session.user.isAdmin ? 'admin' : 'user';

	const accessToken = await new SignJWT({
		sub: userId?.toString() ?? '',
		email,
		role,
	})
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('15m')
		.sign(new TextEncoder().encode(secret));

	return json({ accessToken }, { headers: corsHeaders(event.request) });
};