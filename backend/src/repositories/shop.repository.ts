import { db } from "../db.js";
export const createShopRepository =async (data:{
    name:string;
    address:string;
    city:string;
    latitude:number;
    longitude:number;
    ownerId:string;
})=>{
    return await db.orm.public.Shop.create({
     name: data.name,
    address: data.address,
    city: data.city,
    latitude: data.latitude,
    longitude: data.longitude,
    ownerId: data.ownerId,
  });
};