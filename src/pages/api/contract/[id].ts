// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { AuthenticatedRequest, withAuth } from "@/lib/auth.middleware";
import Contract from "@/lib/db/contract";
import Nft from "@/lib/db/nft";
import db from "@/lib/mongo";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  await db();
  const { id } = req.query;
  console.log({ _id: id, user: req.user._id }, 'id')
  const contract = await Contract.findById(id);
  res.status(200).json({ contract });
}

export default withAuth(handler);
