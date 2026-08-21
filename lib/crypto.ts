import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getKey(): Buffer {
  const raw = process.env.KEY_ENCRYPTION_KEY;
  if (!raw) throw new Error('KEY_ENCRYPTION_KEY not set');
  // Accept either a 32-byte hex string or base64 from Fernet key (first 16 bytes)
  const buf = Buffer.from(raw.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  // Pad or truncate to 32 bytes
  const key = Buffer.alloc(32);
  buf.copy(key, 0, 0, Math.min(buf.length, 32));
  return key;
}

export function encryptKey(raw: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(raw, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decryptKey(enc: string): string {
  const key = getKey();
  const buf = Buffer.from(enc, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const encrypted = buf.subarray(28);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted) + decipher.final('utf8');
}

export function makeHint(raw: string): string {
  return raw.length >= 6 ? raw.slice(0, 6) + '****' : '****';
}
