import { db } from "../db.js";

export const createUserRepository = async (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "CUSTOMER" | "SHOP_OWNER";
}) => {
  return await db.orm.public.User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    phone: data.phone,
    role: data.role ?? "CUSTOMER",
  });
};
export const findUserByEmailRepository = async (email: string) => {
  return await db.orm.public.User.where((user)=>user.email.eq(email)).first();
};