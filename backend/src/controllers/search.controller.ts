import { Request, Response } from "express";
import { searchProducts } from "../services/search.service.js";

export const searchProductsController = async (
  req: Request,
  res: Response
) => {
  const query = req.query.q;

  if (typeof query !== "string" || !query.trim()) {
    return res.status(400).json({
      message: "Search query is required",
    });
  }

  try {
    const result = await searchProducts(query.trim());

    return res.json(result);
  } catch (error) {
    console.error("Search error:", error);

    return res.status(500).json({
      message: "Failed to search products",
    });
  }
};