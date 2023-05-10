import { NextApiRequest, NextApiResponse } from "next";
import { destroyCookie } from "nookies";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  destroyCookie({ res }, "auth", {
    path: "/",
  });

  res.status(200).json({ message: "Successfully cleared cookie!" });
}
