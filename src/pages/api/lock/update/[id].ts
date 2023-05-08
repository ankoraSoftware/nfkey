// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { AuthenticatedRequest, withAuth } from "@/lib/auth.middleware";
import Lock from "@/lib/db/lock";
import db from "@/lib/mongo";
import * as bcrypt from "bcrypt";
import type { NextApiResponse } from "next";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (req.method !== "PATCH") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  await db();

  const hashedApiKey = await bcrypt.hash(req.body.apiKey, 10);

  const lock = await Lock.findByIdAndUpdate(id, {
    name: req.body.name,
    type: req.body.type,
    apiKey: hashedApiKey as string,
  });
  res.status(200).json({ lock });
}

export default withAuth(handler);
