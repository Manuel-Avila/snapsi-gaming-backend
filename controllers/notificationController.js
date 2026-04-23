import * as NotificationModel from "../models/notificationModel.js";
import { handlePaginatedRequest } from "../utils/handlePaginatedRequest.js";

export const getMyNotifications = async (req, res) => {
  const { id: userId } = req.user;

  const modelCall = (limit, cursor) =>
    NotificationModel.getNotificationsByUserId(limit, cursor, userId);

  await handlePaginatedRequest(req, res, "notifications", modelCall);
};
