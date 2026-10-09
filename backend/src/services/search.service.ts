import { searchProductsRepository } from "../repositories/search.repository.js";

export const searchProducts = async (query: string) => {
  const results = await searchProductsRepository(query);

  return {
    results,
  };
};
