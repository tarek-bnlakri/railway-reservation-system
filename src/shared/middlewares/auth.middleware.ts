import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request to type req.user cleanly
export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // 1. Fix typo: req.headers (not req.headres)
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "NO_TOKEN" });
  }

  const token = authHeader.split(" ")[1] as string;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
    );
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ error: "INVALID_TOKEN" });
  }
};