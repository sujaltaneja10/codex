import { SignJWT, jwtVerify } from 'jose';
import { createHash } from 'crypto';
import { config } from '@/lib/config';

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

const encoder = new TextEncoder();

export function generateAccessToken(payload: {
  userId: string;
}): Promise<string> {
  const secret = encoder.encode(config.JWT_ACCESS_SECRET!);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);
}

export function generateRefreshToken(payload: {
  userId: string;
}): Promise<string> {
  const secret = encoder.encode(config.JWT_REFRESH_SECRET!);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}
