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
		jwt({ token, user }) {
			if (user) {
				token.preferredUsername = user.email;
			}

			return token;
		},
		session({ session, token }) {
			if (session.user) {
				session.user.preferredUsername = token.preferredUsername as string | undefined;
				session.user.isAdmin = token.preferredUsername === "zitadel-admin@zitadel.localhost";
			}

			return session;
		}
	}
});

