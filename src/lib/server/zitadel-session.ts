import { env } from '$env/dynamic/private';
const token = env.ZITADEL_SERVICE_ACCOUNT_TOKEN;
const issuer = env.ZITADEL_ISSUER ?? 'http://localhost:8080';

export async function authenticateWithZitadel(loginName: string, password: string) {
	const response = await fetch(`${issuer}/v2/sessions`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			checks: {
				user: { loginName },
				password: { password }
			}
		})
	});

	if (!response.ok) {
		return null;
	}

	return await response.json();
}