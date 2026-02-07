import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

const KEY_LEN = 64;
const SALT_LEN = 16;
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;

const encode = (value: Buffer) => value.toString("base64");
const decode = (value: string) => Buffer.from(value, "base64");

export const hashPassword = async (password: string) => {
  const salt = randomBytes(SALT_LEN);
  const derivedKey = (await scryptAsync(password, salt, KEY_LEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  })) as Buffer;

  return [
    "scrypt",
    String(SCRYPT_N),
    String(SCRYPT_R),
    String(SCRYPT_P),
    encode(salt),
    encode(derivedKey),
  ].join("$");
};

export const verifyPassword = async (password: string, stored: string) => {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") {
    return false;
  }

  const [, n, r, p, saltEncoded, hashEncoded] = parts;
  const salt = decode(saltEncoded);
  const expected = decode(hashEncoded);

  const derivedKey = (await scryptAsync(password, salt, expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  })) as Buffer;

  if (derivedKey.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(expected, derivedKey);
};
