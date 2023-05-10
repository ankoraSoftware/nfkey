import User, { UserDocument } from "@/lib/db/user";
import db from "@/lib/mongo";
import { NextApiRequest, NextApiResponse } from "next";
import * as ethSigUtil from "eth-sig-util";
import { ethers } from "ethers";
import * as jwt from "jsonwebtoken";
import { setCookie } from "nookies";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // Handle the POST request here
  await db();
  const msgParams = {
    data: req.body.message,
    sig: req.body.signature,
  };
  const wallet = ethers.utils.getAddress(
    await ethSigUtil.recoverPersonalSignature(msgParams)
  );
  let user = await User.findOne({ wallet });
  if (!user)
    user = await User.create({
      wallet,
    });
  const token = jwt.sign(
    { _id: user?._id.toString() },
    process.env.AUTH_SECRET as string,
    { expiresIn: "7d" }
  );
  setCookie({ res }, "auth", token, {
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({ message: "Success" });
}
