import { zitadelIssuer, zitadelToken } from './zitadel-config';

const token = zitadelToken;
const issuer = zitadelIssuer;

interface ZitadelSession {
	sessionId?: string;
	session_id?: string;
	sessionToken?: string;
	session_token?: string;
}

export async function authenticateWithZitadel(loginName: string, password: string): Promise<ZitadelSession | null> {
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
	/*
		res example:
			Authenticated user: {
			details: {
				sequence: '4',
				changeDate: '2026-06-21T12:57:53.799923Z',
				resourceOwner: '378334029788741635'
			},
			sessionId: '378411235869196291',
			sessionToken: 'by5Dt5l28HiutJPT-zTFIeLYSSnuprGAXsE13EWB0vIan4fhKe5-k-V4AWdF2MQmSFTxRLXJ6_pEfA'
			}

	*/
	if (!response.ok) {
		return null;
	}
	
	const res:ZitadelSession = await response.json();

	const sessionId = res.sessionId ?? res.session_id;
	const sessionToken = res.sessionToken ?? res.session_token;
	if (!sessionId || !sessionToken) return null;
	const detailsResponse = await fetch(
		`${issuer}/v2/sessions/${sessionId}?sessionToken=${encodeURIComponent(sessionToken)}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/json'
			}
		}
	);
	if (!detailsResponse.ok) return null;
	/*
		example of detailsResponse.json():
		Authenticated user: {
			verifiedAt: '2026-06-21T13:28:45.673549Z',
			id: '378334029789331459',
			loginName: 'zitadel-admin@zitadel.localhost',
			displayName: 'ZITADEL Admin',
			organizationId: '378334029788807171'
		}

	*/
	const details = await detailsResponse.json();
	console.log('Authenticated user details:', details);
	const user = details.session?.factors?.user;
	if (!user?.id) return null;

	//what I want is to return user details
	return user;
}