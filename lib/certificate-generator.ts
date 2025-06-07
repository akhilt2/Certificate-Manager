import QRCode from 'qrcode';
import crypto from 'crypto';

export interface CertificateData {
  participantName: string;
  eventName: string;
  eventDate: string;
  certificateId: string;
  organizerName?: string;
  description?: string;
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export function generateKeyPair(): KeyPair {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  return { publicKey, privateKey };
}

export function signCertificate(data: CertificateData, privateKey: string): string {
  const dataString = JSON.stringify(data);
  const sign = crypto.createSign('SHA256');
  sign.update(dataString);
  return sign.sign(privateKey, 'base64');
}

export function verifyCertificate(data: CertificateData, signature: string, publicKey: string): boolean {
  try {
    const dataString = JSON.stringify(data);
    const verify = crypto.createVerify('SHA256');
    verify.update(dataString);
    return verify.verify(publicKey, signature, 'base64');
  } catch (error) {
    return false;
  }
}

export async function generateQRCode(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
}

export function generateCertificateId(): string {
  return `IEEE-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}