import * as crypto from 'crypto';

export function verifySignature(
  body: string,
  signature: string,
  apiKey: string
): boolean {
  try {
    const hmac = crypto.createHmac('sha256', apiKey);
    const expected = hmac.update(body).digest('hex');
    
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expected, 'hex')
    );
  } catch {
    return false;
  }
}
