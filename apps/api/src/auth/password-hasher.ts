import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'crypto';

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

export class PasswordHasher {
  hash(password: string): string {
    const salt = randomBytes(SALT_LENGTH).toString('base64url');
    const derived = scryptSync(password, salt, KEY_LENGTH).toString('base64url');
    return `scrypt$${salt}$${derived}`;
  }

  verify(password: string, passwordHash: string): boolean {
    const [algorithm, salt, stored] = passwordHash.split('$');
    if (algorithm !== 'scrypt' || !salt || !stored) return false;

    const actual = Buffer.from(scryptSync(password, salt, KEY_LENGTH).toString('base64url'));
    const expected = Buffer.from(stored);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('base64url');
  }
}
