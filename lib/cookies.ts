import { serialize } from 'cookie';
import { config } from './config';
import { NextApiResponse } from 'next';

export function setAuthCookies(
  res: NextApiResponse,
  accessToken: string,
  refreshToken: string
) {
  const accessTokenCookie = serialize('access-token', accessToken, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 15, // 15 min
    path: '/',
  });

  const refreshTokenCookie = serialize('refresh-token', refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    path: '/',
  });

  res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
}
