// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { AuthenticatedRequest, withAuth } from '@/lib/auth.middleware';
import Lock from '@/lib/db/lock';
import Nft from '@/lib/db/nft';
import { LockHelper } from '@/lib/locks/locks';
import db from '@/lib/mongo';
import { ELock } from '@/pages/lock/create';
import type { NextApiRequest, NextApiResponse } from 'next';
import CryptoJS from 'crypto-js';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  await db();

  // Handle the POST request here
  const lock = await Lock.findById(req.body.lock?._id.toString());
  if (!lock) {
    res.status(200).json({ status: 'NOT OK' });
    return;
  }
  const apiKey = CryptoJS.AES.decrypt(
    lock?.apiKey as string,
    process.env.HASH_SECRET_KEY as string
  ).toString(CryptoJS.enc.Utf8);
  const lockHelper = new LockHelper(req.body.lock?.type as ELock, apiKey);
  //@ts-ignore
  const lockData = await lockHelper.lock?.getLock(lock.metadata.id);
  console.log(lockData, 'lockkkkk');

  const lockStatus = lockData?.data.state.state;
  if (lockStatus === 3 || lockStatus === 5)
    //@ts-ignore
    res.status(200).json({
      lockAction: 'Lock',
    });
  else if (lockStatus === 1)
    //@ts-ignore
    res.status(200).json({
      lockAction: 'Unlock',
    });
  res.status(200).json({
    lockAction: 'Loading...',
  });
}

export default withAuth(handler);
