import { randomInt, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_KEYLEN = 64;
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;

export function generateOtpDigits(length = 6): string {
  const max = 10 ** length;
  const n = randomInt(0, max);
  return String(n).padStart(length, "0");
}

export function hashOtpCode(code: string, salt: Buffer): Buffer {
  return scryptSync(code, salt, SCRYPT_KEYLEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P });
}

export function randomOtpSalt(): Buffer {
  return randomBytes(16);
}

export function verifyOtpCode(code: string, salt: Buffer, expectedHash: Buffer): boolean {
  if (expectedHash.length !== SCRYPT_KEYLEN) return false;
  const got = hashOtpCode(code, salt);
  if (got.length !== expectedHash.length) return false;
  return timingSafeEqual(got, expectedHash);
}
