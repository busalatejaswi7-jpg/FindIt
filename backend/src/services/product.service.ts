import { createProductRepository } from "../repositories/product.repository.js";

export const createProduct = async (data: {
  name: string;
  description?: string;
  category: string;
  image?: string;
}) => {
  const product = await createProductRepository(data);

  return product;
};