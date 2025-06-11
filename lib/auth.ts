import { SignJWT, jwtVerify } from 'jose';
import { createHash } from 'crypto';

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

const encoder = new TextEncoder();

export function generateAccessToken(payload: {
  userId: string;
}): Promise<string> {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error('JWT_ACCESS_SECRET environment variable is not defined');
  }

  const secret = encoder.encode(process.env.JWT_ACCESS_SECRET!);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);
}

export function generateRefreshToken(payload: {
  userId: string;
}): Promise<string> {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET environment variable is not defined');
  }

  const secret = encoder.encode(process.env.JWT_REFRESH_SECRET!);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}
