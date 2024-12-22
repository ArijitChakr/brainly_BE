import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";
import { NextFunction, Request, Response } from "express";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.token;

  const userId = jwt.verify(token as string, JWT_SECRET);

  if (userId) {
    //@ts-ignore
    req.id = userId.id;
    next();
  } else {
    res.status(411).json({
      message: "You are not logged in",
    });
  }
}
