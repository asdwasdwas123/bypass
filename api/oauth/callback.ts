import type { VercelRequest, VercelResponse } from '@vercel/node';
import { COOKIE_NAME, ONE_YEAR_MS } from '../../shared/const';
import * as db from '../../server/db';
import { sdk } from '../../server/_core/sdk';
import 'dotenv/config';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, state } = req.query;

  if (typeof code !== 'string' || typeof state !== 'string') {
    return res.status(400).json({ error: 'code and state are required' });
  }

  try {
    const tokenResponse = await sdk.exchangeCodeForToken(code, state);
    const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

    if (!userInfo.openId) {
      return res.status(400).json({ error: 'openId missing from user info' });
    }

    await db.upsertUser({
      openId: userInfo.openId,
      name: userInfo.name || null,
      email: userInfo.email ?? null,
      loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
      lastSignedIn: new Date(),
    });

    const sessionToken = await sdk.createSessionToken(userInfo.openId, {
      name: userInfo.name || '',
      expiresInMs: ONE_YEAR_MS,
    });

    // Determine if we're on HTTPS
    const isSecure = req.headers['x-forwarded-proto'] === 'https' || 
                     req.headers.host?.includes('vercel.app');

    res.setHeader('Set-Cookie', [
      `${COOKIE_NAME}=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(ONE_YEAR_MS / 1000)}${isSecure ? '; Secure' : ''}`
    ]);

    return res.redirect(302, '/');
  } catch (error) {
    console.error('[OAuth] Callback failed', error);
    return res.status(500).json({ error: 'OAuth callback failed' });
  }
}
