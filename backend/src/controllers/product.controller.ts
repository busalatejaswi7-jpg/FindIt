import { Request, Response } from "express";
import { createProduct } from "../services/product.service.js";

export const createProductController = async (
  req: Request,
  res: Response
) => {
  const { name, description, category, image } = req.body;

  if (!name || !category) {
    return res.status(400).json({
      message: "Name and category are required",
    });
  }

  try {
    const product = await createProduct({
      name,
      description,
      category,
      image,
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      message: "Failed to create product",
    });
  }
};