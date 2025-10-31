import type{ Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

import "dotenv/config" 

// Extend Express Request type to include user info
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | string;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    if(!token) return
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    //req.user.id
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
