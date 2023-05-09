// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { AuthenticatedRequest, withAuth } from "@/lib/auth.middleware";
import { UserDocument } from "@/lib/db/user";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  user: UserDocument;
};

function handler(req: AuthenticatedRequest, res: NextApiResponse<Data>) {
  res.status(200).json({ user: req.user });
}

export default withAuth(handler);
