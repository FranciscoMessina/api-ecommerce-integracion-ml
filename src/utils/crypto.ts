import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

@Injectable()
export class CryptoService {
  key;

  constructor() {
    this.key = createHash('sha256').update(process.env.ENCRYPTION_SECRET).digest().slice(0, 32);
  }

  encrypt(text: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-ctr', this.key, iv);

    const encryption = Buffer.concat([cipher.update(text), cipher.final()]);

    // console.log(`${iv.toString('hex')}.${encryption.toString('hex')}`);

    return `${iv.toString('hex')}|${encryption.toString('hex')}`;
  }

  decrypt(text: string): string {
    const [iv, encryptedText] = text.split('|');

    const decipher = createDecipheriv('aes-256-ctr', this.key, Buffer.from(iv, 'hex'));

    const decryptedText = Buffer.concat([decipher.update(Buffer.from(encryptedText, 'hex')), decipher.final()]);

    // console.log(decryptedText.toString());

    return decryptedText.toString();
  }
}
