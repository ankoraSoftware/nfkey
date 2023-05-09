// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { AuthenticatedRequest, withAuth } from "@/lib/auth.middleware";
import Nft from "@/lib/db/nft";
import db from "@/lib/mongo";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  await db();
  // Handle the POST request here

  const nft = await Nft.create({
    metadata: req.body,
    user: req.user._id.toString(),
  });
  res.status(200).json({ nft });
}

export default withAuth(handler);
