import { SvelteKitAuth } from '@auth/sveltekit';
import Credentials from '@auth/sveltekit/providers/credentials';
import { env } from '$env/dynamic/private';
import { authenticateWithZitadel } from '$lib/server/zitadel-session';

export const { handle, signIn, signOut } = SvelteKitAuth({
	trustHost: true,
	secret: env.AUTH_SECRET,
	providers: [
		Credentials({
			name: 'ZITADEL',
			credentials: {
				loginName: { label: 'Email or username', type: 'text' },
				password: { label: 'Password', type: 'password' }
			},
			async authorize(credentials) {
				const loginName = typeof credentials.loginName === 'string' ? credentials.loginName : '';
				const password = typeof credentials.password === 'string' ? credentials.password : '';

				const user:any = await authenticateWithZitadel(loginName, password);
				if (!user) {
					return null;
				}
				return {
					id: user.id,
					name: user.loginName,
					email: user.loginName,
                    isAdmin:(user.loginName==="zitadel-admin@zitadel.localhost")
				};
			}
		})
	],
	callbacks: {
		redirect({ url, baseUrl }) {
			const allowed = [
				baseUrl,
				'http://localhost:5001',
				'http://localhost:5003'
			];
			if (url.startsWith('/')) {
				return `${baseUrl}${url}`;
			}
			try {
				const target = new URL(url);
				if (allowed.includes(target.origin)) {
					return target.toString();
				}
			} catch {
				// ignore
			}
			return baseUrl;
		},
		jwt({ token, user }) {
			if (user) {
				token.sub = user.id;
				token.email = user.email;
				// user may be typed as User | AdapterUser; cast to any for custom prop
				token.isAdmin = (user as any).isAdmin;
			}
			return token;

		},
		session({ session, token }) {
			if (session.user) {
				(session.user as any).id = token.sub;
				// token.email can be string | null | undefined — ensure a string for session.user.email
				session.user.email = token.email ?? '';
				// token.isAdmin may be unknown; ensure boolean | undefined
				session.user.isAdmin = typeof token.isAdmin === 'boolean' ? token.isAdmin : undefined;
			}

			return session;
		}
	}
});

