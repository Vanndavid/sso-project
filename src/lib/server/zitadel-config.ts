import { env } from '$env/dynamic/private';

export const zitadelToken = env.ZITADEL_SERVICE_ACCOUNT_TOKEN;
export const zitadelIssuer = env.ZITADEL_ISSUER ?? 'http://localhost:8080';
