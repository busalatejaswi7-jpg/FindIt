import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth.middleware.js";
export const requireRole = (allowedRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (user.role !== allowedRole) {
      return res.status(403).json({
        message: "You are not authorized to perform this action",
      });
    }

    next();
  };
};
