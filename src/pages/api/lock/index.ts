// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { AuthenticatedRequest, withAuth } from "@/lib/auth.middleware";
import Lock from "@/lib/db/lock";
import db from "@/lib/mongo";
import type { NextApiResponse } from "next";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  await db();

  const lock = await Lock.find();
  res.status(200).json({ lock });
}

export default withAuth(handler);
