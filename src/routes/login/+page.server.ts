import { fail } from '@sveltejs/kit';
import {
	findUserByLoginName,
	requestResetCode,
	setNewPassword
} from '$lib/server/zitadel-password';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	if (session?.user) {
		return { alreadyLoggedIn: true };
	}

	return { alreadyLoggedIn: false };
};

export const actions = {
	requestCode: async (event) => {
		const form = await event.request.formData();
		const loginName = String(form.get('loginName') ?? '').trim();

		if (!loginName) {
			return fail(400, { message: 'Enter your login name.' });
		}

		const user = await findUserByLoginName(loginName);

		if (!user) {
			return fail(400, { message: 'User not found.' });
		}

		const verificationCode = await requestResetCode(user.userId);

		if (!verificationCode) {
			return fail(400, { message: 'Could not request reset code.' });
		}

		return {
			step: 'reset',
			userId: user.userId,
			loginName: user.loginName,
			verificationCode
		};
	},

	resetPassword: async (event) => {
		const form = await event.request.formData();
		const userId = String(form.get('userId') ?? '').trim();
		const verificationCode = String(form.get('verificationCode') ?? '').trim();
		const password = String(form.get('password') ?? '');

		if (!userId || !verificationCode || !password) {
			return fail(400, { message: 'All fields are required.' });
		}

		const result = await setNewPassword(userId, verificationCode, password);
		if (!result.ok) {
			return fail(400, { message: result.message });
		}

		return {
			step: 'done',
			message: 'Password updated. You can log in now.'
		};
	}
} satisfies Actions;