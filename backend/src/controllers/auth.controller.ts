import { Request, Response } from "express";
import { loginUser } from "../services/auth.service.js";

export const loginController = async (
  req: Request,
  res: Response
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  try {
    const result = await loginUser(
      email.trim(),
      password
    );

    return res.json(result);
  } catch (error) {
    console.error("Login error:", error);

    if (
      error instanceof Error &&
      error.message === "Invalid email or password"
    ) {
      return res.status(401).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to login",
    });
  }
};