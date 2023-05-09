import User, { UserDocument } from "@/lib/db/user";
import db from "@/lib/mongo";
import { NextApiRequest, NextApiResponse } from "next";
import * as ethSigUtil from "eth-sig-util";
import {  ethers } from "ethers";
import * as jwt from "jsonwebtoken";
import { setCookie } from "nookies";
import { AuthenticatedRequest, withAuth } from "@/lib/auth.middleware";
import Contract from "@/lib/db/contract";

 async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  await db();
  if (req.method === "POST") {
    const contract = await Contract.create({...req.body, user: req.user._id})
    res.status(200).json({ contract });
    return;
  }else if(req.method === "GET") {
    const contracts = await Contract.find({ user: req.user._id})
    res.status(200).json({contracts})
    return;
  }

  

 
}

export default withAuth(handler)