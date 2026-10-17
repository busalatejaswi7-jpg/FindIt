import { getShopDashboardRepository } from "../repositories/shop-dashboard.repository.js";

export const getShopDashboard = async (ownerId: string) => {
  return await getShopDashboardRepository(ownerId);
};
