import { db } from "../db.js";
import "temporal-polyfill/full/global";
import { Temporal } from "temporal-polyfill/full";
export const createReservationRepository = async (data: {
  userId: string;
  inventoryId: string;
  quantity: number;
}) => {
  return await db.transaction(async (tx) => {
    const inventory = await tx.orm.public.Inventory
      .where({ id: data.inventoryId })
      .first();

    if (!inventory) {
      throw new Error("Inventory not found");
    }

    if (inventory.quantity < data.quantity) {
      throw new Error("Not enough inventory available");
    }

    const updatedInventory = await tx.orm.public.Inventory
      .where({ id: data.inventoryId })
      .where((item) => item.quantity.gte(data.quantity))
      .update({
       quantity:inventory.quantity - data.quantity,
        updatedAt: Temporal.Now.instant(),
      });

    if (!updatedInventory) {
      throw new Error("Inventory was already changed. Please try again.");
    }

    const reservation = await tx.orm.public.Reservation.create({
      userId: data.userId,
      inventoryId: data.inventoryId,
      quantity: data.quantity,
      status: "PENDING",
    });

    return reservation;
  });
};
export const getReservationsByUserRepository = async (
  userId: string
) => {
  const reservations = await db.orm.public.Reservation
    .where((reservation) => reservation.userId.eq(userId))
    .all();

  if (reservations.length === 0) {
    return [];
  }

  const inventoryIds = reservations.map(
    (reservation) => reservation.inventoryId
  );

  const inventoryItems = await db.orm.public.Inventory
    .where((item) => item.id.in(inventoryIds))
    .include("product")
    .include("shop")
    .all();

  return reservations.map((reservation) => {
    const inventory = inventoryItems.find(
      (item) => item.id === reservation.inventoryId
    );

    return {
      id: reservation.id,
      quantity: reservation.quantity,
      status: reservation.status,
      createdAt: reservation.createdAt,
      inventoryId: reservation.inventoryId,

      product: inventory
        ? {
            id: inventory.product.id,
            name: inventory.product.name,
            category: inventory.product.category,
            description: inventory.product.description,
          }
        : null,

      shop: inventory
        ? {
            id: inventory.shop.id,
            name: inventory.shop.name,
            address: inventory.shop.address,
            city: inventory.shop.city,
          }
        : null,
    };
  });
};