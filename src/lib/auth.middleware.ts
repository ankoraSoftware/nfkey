import jwt from "jsonwebtoken";
import { verify } from "jsonwebtoken";
import { parseCookies } from "nookies";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import User, { UserDocument } from "./db/user";

interface DecodedToken {
  // Define the properties of your decoded JWT token
  _id: string;
}
export interface AuthenticatedRequest extends NextApiRequest {
  user: UserDocument;
}

export const withAuth =
  (handler: any) => async (req: NextApiRequest, res: NextApiResponse) => {
    // Get the JWT token from the cookie
    const cookies = parseCookies({ req });
    const token = cookies.auth;
    console.log(token, "TOKEN");
    if (!token) {
      // If the JWT token is not present, return a 401 unauthorized error
      return res
        .status(401)
        .json({ message: "Authentication failed: JWT token missing" });
    }

    try {
      // Verify the JWT token using the secret key
      const decoded = (await verify(
        token,
        process.env.AUTH_SECRET as string
      )) as unknown as DecodedToken;

      const user = await User.findById(decoded._id);
      return handler({ ...req, user }, res);
    } catch (error) {
      // If the JWT token is invalid, return a 401 unauthorized error
      return res
        .status(401)
        .json({ message: "Authentication failed: JWT token invalid" });
    }
  };
