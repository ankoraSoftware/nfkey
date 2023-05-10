import db from '@/lib/mongo';
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth } from '@/lib/auth.middleware';
import KeyAccess from '@/lib/db/key-access';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await db();
  if (req.method === 'POST') {
    const keyAccess = await KeyAccess.create({
      ...req.body,
      user: req.user._id,
    });
    res.status(200).json({ keyAccess });
    return;
  }
  if (req.method === 'PUT') {
    const keyAccess = await KeyAccess.updateOne(
      { signature: req.body.signature },
      { owner: req.body.owner }
    );
    res.status(200).json({ keyAccess });
    return;
  }
  if (req.method === 'GET') {
    const keyAccesses = await KeyAccess.find({
      user: req.user._id,
      contract: req.query.contract,
    });
    res.status(200).json({ keyAccesses });
    return;
  }
}

export default withAuth(handler);
