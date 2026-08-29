import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface UserPayload extends jwt.JwtPayload {
  userId: string;
}
export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "NO_TOKEN" });
  }

  const token = authHeader.split(" ")[1] as string;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
    )as UserPayload;
    req.user = decoded;
    return next();
  } catch{
    return res.status(401).json({ error: "INVALID_TOKEN" });
  }
};