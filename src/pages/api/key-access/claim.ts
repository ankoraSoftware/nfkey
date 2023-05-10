import db from '@/lib/mongo';
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth } from '@/lib/auth.middleware';
import KeyAccess from '@/lib/db/key-access';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await db();
  // TODO: refactor to extract owner from tx
  // Its hack
  if (req.method === 'PUT') {
    const keyAccess = await KeyAccess.findByIdAndUpdate(
      { _id: req.body.id },
      {
        owner: req.body.owner,
      }
    );
    res.status(200).json({ keyAccess });
    return;
  }

  if (req.method === 'GET') {
    console.log(req.query.id, 'ass');
    const keyAccess = await KeyAccess.findById(req.query.id).populate([
      'user',
      'contract',
    ]);
    res.status(200).json({ keyAccess });
    return;
  }
}

export default handler;
