import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const PREFIX = "pm$scrypt$";
const SCRYPT_LEN = 64;
const SALT_LEN = 16;

export async function hashSecret(plain: string): Promise<string> {
  const salt = randomBytes(SALT_LEN);
  const derived = (await scryptAsync(plain.normalize("NFKC"), salt, SCRYPT_LEN)) as Buffer;
  return `${PREFIX}${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

export async function verifySecret(plain: string, stored: string | null | undefined): Promise<boolean> {
  if (!stored || !stored.startsWith(PREFIX)) return false;
  const rest = stored.slice(PREFIX.length);
  const dollar = rest.indexOf("$");
  if (dollar < 1) return false;
  const saltB64 = rest.slice(0, dollar);
  const hashB64 = rest.slice(dollar + 1);
  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(saltB64, "base64url");
    expected = Buffer.from(hashB64, "base64url");
  } catch {
    return false;
  }
  if (salt.length !== SALT_LEN || expected.length !== SCRYPT_LEN) return false;
  const derived = (await scryptAsync(plain.normalize("NFKC"), salt, SCRYPT_LEN)) as Buffer;
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

export function randomKeyToken(): string {
  return randomBytes(24).toString("base64url");
}
