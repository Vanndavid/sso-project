import { zitadelIssuer, zitadelToken } from './zitadel-config';

const token = zitadelToken;
const issuer = zitadelIssuer;

interface ListUsersResponse {
	result?: Array<{
		userId?: string;
		preferredLoginName?: string;
		username?: string;
	}>;
}

interface PasswordResetResponse {
	verificationCode?: string;
}

export async function findUserByLoginName(loginName: string) {
	const response = await fetch(`${issuer}/v2/users`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			query: {
				offset: '0',
				limit: 1
			},
			queries: [
				{
					loginNameQuery: {
						loginName,
						method: 'TEXT_QUERY_METHOD_EQUALS'
					}
				}
			]
		})
	});

	if (!response.ok) {
		return null;
	}

	const data: ListUsersResponse = await response.json();
	const user = data.result?.[0];

	if (!user?.userId) {
		return null;
	}

	return {
		userId: user.userId,
		loginName: user.preferredLoginName ?? user.username ?? loginName
	};
}

export async function requestResetCode(userId: string) {
	const response = await fetch(`${issuer}/v2/users/${userId}/password_reset`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			returnCode: {}
		})
	});

	if (!response.ok) {
		return null;
	}

	const data: PasswordResetResponse = await response.json();
	return data.verificationCode ?? null;
}

export async function setNewPassword(userId: string, verificationCode: string, password: string) {
	const response = await fetch(`${issuer}/v2/users/${userId}/password`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			newPassword: {
				password,
				changeRequired: false
			},
			verificationCode
		})
	});

	if (!response.ok) {
		return null;
	}

	return await response.json();
}