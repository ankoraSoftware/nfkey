// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { AuthenticatedRequest, withAuth } from '@/lib/auth.middleware';
import Lock from '@/lib/db/lock';
import db from '@/lib/mongo';
import CryptoJS from 'crypto-js';
import type { NextApiResponse } from 'next';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  await db();

  const secretKey = 'SecretKey245';
  const encryptMessage = (text: string) => {
    return CryptoJS.AES.encrypt(text, secretKey).toString();
  };

  const decryptMessage = (text: string) => {
    return CryptoJS.AES.decrypt(text, secretKey).toString(CryptoJS.enc.Utf8);
  };

  const hashedApiKey = encryptMessage(req.body.apiKey);
  console.log('encrypt->', hashedApiKey);
  console.log('decr->', decryptMessage(hashedApiKey));

  const lock = await Lock.create({
    name: req.body.name,
    type: req.body.type,
    apiKey: hashedApiKey,
    user: req.body.user,
    metadata: req.body.metadata,
  });
  res.status(200).json({ lock });
}

export default withAuth(handler);
