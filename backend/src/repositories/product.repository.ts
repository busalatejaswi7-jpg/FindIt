import { db } from "../db.js";

export const createProductRepository = async (data: {
  name: string;
  description?: string;
  category: string;
  image?: string;
}) => {
 return await db.orm.public.Product.create({
  name: data.name,
  description: data.description,
  category: data.category,
  image: data.image,
});
};