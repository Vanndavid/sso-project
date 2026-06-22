import { zitadelIssuer, zitadelToken } from './zitadel-config';

const token = zitadelToken;
const issuer = zitadelIssuer;

export interface UserRow {
	id: string;
	loginName: string;
	displayName: string;
	email: string;
}

interface ZitadelUser {
	userId?: string;
	preferredLoginName?: string;
	username?: string;
	details?: {
		resourceOwner?: string;
	};
	human?: {
		profile?: {
			displayName?: string;
		};
		email?: {
			email?: string;
		};
	};
}

interface ListUsersResponse {
	result?: ZitadelUser[];
}

export async function listUsers(): Promise<UserRow[]> {
	const response = await fetch(`${issuer}/v2/users`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			query: {
				offset: '0',
				limit: 100
			}
		})
	});

	if (!response.ok) {
		return [];
	}

	const data: ListUsersResponse = await response.json();

	return (data.result ?? [])
		.map((user) => {
			const loginName = user.preferredLoginName ?? user.username;
			if (!user.userId || !loginName) return null;

			return {
				id: user.userId,
				loginName,
				displayName: user.human?.profile?.displayName ?? loginName,
				email: user.human?.email?.email ?? loginName
			};
		})
		.filter((user): user is UserRow => user !== null);
}

export async function createUser(input: {
	username: string;
	email: string;
	password: string;
	displayName: string;
}) {
	const users = await listUsers();
	if (users.length === 0) {
		return null;
	}

	const orgResponse = await fetch(`${issuer}/v2/users/${users[0].id}`, {
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/json'
		}
	});

	if (!orgResponse.ok) {
		return null;
	}

	const orgData: { user?: ZitadelUser } = await orgResponse.json();
	const organizationId = orgData.user?.details?.resourceOwner;

	if (!organizationId) {
		return null;
	}

	const response = await fetch(`${issuer}/v2/users/new`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			username: input.username,
			organizationId,
			human: {
				profile: {
					givenName: input.displayName,
					familyName: input.displayName,
					displayName: input.displayName
				},
				email: {
					email: input.email,
					isVerified: true
				},
				password: {
					password: input.password,
					changeRequired: false
				}
			}
		})
	});

	if (!response.ok) {
		return null;
	}

	return await response.json();
}

export async function updateUser(
	userId: string,
	input: {
		displayName: string;
		email: string;
	}
) {
	const response = await fetch(`${issuer}/v2/users/${userId}`, {
		method: 'PATCH',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			human: {
				profile: {
					givenName: input.displayName,
					familyName: input.displayName,
					displayName: input.displayName
				},
				email: {
					email: input.email,
					isVerified: true
				}
			}
		})
	});

	if (!response.ok) {
		return null;
	}

	return await response.json();
}