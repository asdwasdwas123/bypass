import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveHTTPResponse } from '@trpc/server/http';
import { appRouter } from '../../server/routers';
import type { User } from '../../drizzle/schema';
import { COOKIE_NAME } from '../../shared/const';
import * as db from '../../server/db';
import { jwtVerify } from 'jose';
import superjson from 'superjson';
import 'dotenv/config';

// Context type for Vercel serverless
export type TrpcContext = {
  req: VercelRequest;
  res: VercelResponse;
  user: User | null;
};

async function verifySession(cookieValue: string | undefined | null): Promise<{ openId: string } | null> {
  if (!cookieValue) return null;

  try {
    const secret = process.env.JWT_SECRET || '';
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(cookieValue, secretKey, {
      algorithms: ['HS256'],
    });
    const { openId } = payload as Record<string, unknown>;
    if (typeof openId !== 'string' || !openId) return null;
    return { openId };
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  
  cookieHeader.split(';').forEach(cookie => {
    const [key, ...val] = cookie.split('=');
    if (key) {
      cookies[key.trim()] = val.join('=').trim();
    }
  });
  return cookies;
}

async function createContext(req: VercelRequest, res: VercelResponse): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const cookieHeader = req.headers.cookie || '';
    const cookies = parseCookies(cookieHeader);
    const sessionCookie = cookies[COOKIE_NAME];
    const session = await verifySession(sessionCookie);

    if (session) {
      user = await db.getUserByOpenId(session.openId) || null;
    }
  } catch (error) {
    console.error('[Context] Error getting user:', error);
    user = null;
  }

  return { req, res, user };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get the path from URL
  const url = new URL(req.url || '', `https://${req.headers.host}`);
  const path = url.pathname.replace('/api/trpc/', '');

  const ctx = await createContext(req, res);

  const httpResponse = await resolveHTTPResponse({
    router: appRouter,
    path,
    req: {
      method: req.method || 'GET',
      headers: req.headers as Record<string, string | string[]>,
      query: url.searchParams,
      body: req.body ? JSON.stringify(req.body) : undefined,
    },
    createContext: async () => ctx,
    responseMeta: () => ({}),
  });

  // Set response headers
  if (httpResponse.headers) {
    Object.entries(httpResponse.headers).forEach(([key, value]) => {
      if (value) {
        res.setHeader(key, value);
      }
    });
  }

  // Send response
  return res.status(httpResponse.status).send(httpResponse.body);
}
