import { SignJWT, jwtVerify } from 'jose';
import { createHash } from 'crypto';
import { config } from '@/lib/config';
import { nanoid } from 'nanoid';

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function getJwtSecretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function verifyJwt(token: string) {
  try {
    const { payload } = await jwtVerify(
      token,
      getJwtSecretKey(config.JWT_ACCESS_SECRET),
      { issuer: config.PROJECT_NAME, audience: config.PROJECT_NAME }
    );

    return payload;
  } catch (error) {
    console.error('Could not verify JWT: ', error);
    throw new Error('Could not verify JWT');
  }
}

export function generateAccessToken(payload: {
  userId: string;
}): Promise<string> {
  const secret = getJwtSecretKey(config.JWT_ACCESS_SECRET);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(nanoid())
    .setIssuedAt()
    .setIssuer(config.PROJECT_NAME)
    .setAudience(config.PROJECT_NAME)
    .setExpirationTime('15m')
    .sign(secret);
}

export function generateRefreshToken(payload: {
  userId: string;
}): Promise<string> {
  const secret = getJwtSecretKey(config.JWT_REFRESH_SECRET);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(nanoid())
    .setIssuedAt()
    .setIssuer(config.PROJECT_NAME)
    .setAudience(config.PROJECT_NAME)
    .setExpirationTime('7d')
    .sign(secret);
}
