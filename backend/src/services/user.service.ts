import bcrypt from "bcryptjs";
import { createUserRepository, findUserByEmailRepository } from "../repositories/user.repository.js";

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "CUSTOMER" | "SHOP_OWNER";
}) => {
  const hashedPassword =await bcrypt.hash(data.password,10);
  const user = await createUserRepository({
    ...data,
  password:hashedPassword,});
const { password, ...safeUser } = user;

  return safeUser;
};
export const findUserByEmail = async (email: string) => {
  const user = await findUserByEmailRepository(email);
  return user;
};