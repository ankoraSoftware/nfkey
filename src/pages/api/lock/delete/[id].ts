// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { AuthenticatedRequest, withAuth } from "@/lib/auth.middleware";
import Lock from "@/lib/db/lock";
import db from "@/lib/mongo";
import type { NextApiResponse } from "next";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (req.method !== "DELETE") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  await db();

  await Lock.findByIdAndRemove(id);
  res.status(200).json({ status: "ok" });
}

export default withAuth(handler);
