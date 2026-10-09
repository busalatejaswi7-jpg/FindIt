import {
  createReservationRepository,
  getReservationsByUserRepository,
} from "../repositories/reservation.repository.js";

export const createReservation = async (data: {
  userId: string;
  inventoryId: string;
  quantity: number;
}) => {
  return await createReservationRepository(data);
};

export const getReservationsByUser = async (
  userId: string
) => {
  return await getReservationsByUserRepository(userId);
};