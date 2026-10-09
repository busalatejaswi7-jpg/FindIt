import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmailRepository } from "../repositories/user.repository.js";
 
const JWT_SECRET = process.env.JWT_SECRET;
if(!JWT_SECRET){
    throw new Error("jwt is not configured");
}
export const loginUser=async(
    email:string,
    password:string,
)=>{
    const user= await findUserByEmailRepository(email);
    if(!user){
        throw new Error("Inavlid email or Password");
    }
    const passwordMatches=await bcrypt.compare(
        password,user.password
    );
    if(!passwordMatches){
        throw new Error("invalid  email or password");
    }
    const token=jwt.sign({
        userId:user.id,
        role:user.role,
    },
JWT_SECRET,
{
    expiresIn:"7d",
}
);
return {
    token,
    user:{
        id:user.id,
        name:user.name,
        email:user.email,
        phone:user.phone,
        role:user.role,
    },
};
};

