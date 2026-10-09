import { Request, Response } from "express";
import { createUser, findUserByEmail } from "../services/user.service.js";

export const createUserController = async (
  req: Request,
  res: Response
) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email and password are required",
    });
  }

  try {
    const user = await createUser({
      name,
      email,
      password,
      phone,
      role,
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error("Create user error:", error);

    return res.status(500).json({
      message: "Failed to create user",
    });
  }
};
export const findUserByEmailController = async (
  req: Request,
  res: Response
) => {
  const email = req.query.email;

  if (typeof email !== "string" || !email.trim()) {
    return res.status(400).json({
      message: "Email is required",
    });
  }

  try {
    const user = await findUserByEmail(email.trim());

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json(user);
  } catch (error) {
    console.error("Find user error:", error);

    return res.status(500).json({
      message: "Failed to find user",
    });
  }
};