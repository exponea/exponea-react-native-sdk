import { hmac } from '@noble/hashes/hmac.js';
import { sha512 } from '@noble/hashes/sha2.js';
import { utf8ToBytes } from '@noble/hashes/utils.js';

const defaultExpirationMinutes = 15;

function base64url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]!);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/[=]/g, '');
}

function base64urlStr(str: string): string {
  return base64url(new TextEncoder().encode(str));
}

/**
 * !!! WARN for developers.
 * This implementation is just proof of concept for the Example App.
 * In production, JWT tokens MUST be generated on a secure backend.
 * Never embed signing secrets in a shipping application.
 */
class LocalJwtTokenGenerator {
  private secret = '';
  private kid = '';

  configure(secret: string, kid: string): void {
    this.secret = secret;
    this.kid = kid;
    console.log(
      `Configured, secret present: ${this.secret.length > 0}, kid: ${this.kid}`
    );
  }

  isConfigured(): boolean {
    return this.secret.length > 0 && this.kid.length > 0;
  }

  generateToken(customerIds: Record<string, string>): string | null {
    if (this.secret.length === 0) {
      console.warn('Secret is not configured, skipping token generation.');
      return null;
    }
    if (this.kid.length === 0) {
      console.warn('Kid is not configured, skipping token generation.');
      return null;
    }
    if (Object.keys(customerIds).length === 0) {
      console.warn(
        'Token without customer IDs would not be valid, skipping generation.'
      );
      return null;
    }
    try {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = now + defaultExpirationMinutes * 60;
      const header = base64urlStr(
        JSON.stringify({ typ: 'JWT', alg: 'HS512', kid: this.kid })
      );
      const payload = base64urlStr(
        JSON.stringify({ exp: expiresAt, ids: customerIds })
      );
      const signingInput = `${header}.${payload}`;
      const sig = base64url(
        hmac(sha512, utf8ToBytes(this.secret), utf8ToBytes(signingInput))
      );
      const token = `${signingInput}.${sig}`;
      console.log(
        `Token generated, expires at ${new Date(expiresAt * 1000).toISOString()}, ids: ${Object.keys(customerIds)}.`
      );
      return token;
    } catch (e: unknown) {
      console.error(
        `Token generation failed: ${e instanceof Error ? e.message : e}`
      );
      return null;
    }
  }
}

export default new LocalJwtTokenGenerator();
