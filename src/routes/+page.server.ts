import { fail } from '@sveltejs/kit';
import { createUser, listUsers, updateUser } from '$lib/server/zitadel-users';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	if (!session?.user?.isAdmin) {
		return { users: [] };
	}

	const users: any[] = await listUsers();
	return { users };
};

export const actions = {
	create: async (event) => {
		const session = await event.locals.auth();

		if (!session?.user?.isAdmin) {
			return fail(403, { message: 'Admin only' });
		}

		const form = await event.request.formData();
		const username = String(form.get('username') ?? '').trim();
		const email = String(form.get('email') ?? '').trim();
		const password = String(form.get('password') ?? '');
		const displayName = String(form.get('displayName') ?? '').trim();

		if (!username || !email || !password || !displayName) {
			return fail(400, { message: 'All fields are required.' });
		}

		const result = await createUser({
			username,
			email,
			password,
			displayName
		});

		if (!result) {
			return fail(400, { message: 'Could not create user.' });
		}
	},

	update: async (event) => {
		const session = await event.locals.auth();

		if (!session?.user?.isAdmin) {
			return fail(403, { message: 'Admin only' });
		}

		const form = await event.request.formData();
		const userId = String(form.get('userId') ?? '').trim();
		const email = String(form.get('email') ?? '').trim();
		const displayName = String(form.get('displayName') ?? '').trim();

		if (!userId || !email || !displayName) {
			return fail(400, { message: 'All fields are required.' });
		}

		const result = await updateUser(userId, {
			email,
			displayName
		});

		if (!result) {
			return fail(400, { message: 'Could not update user.' });
		}
	}
} satisfies Actions;