import * as UserModel from "../models/userModel.js";
import * as NotificationModel from "../models/notificationModel.js";

export const getProfile = async (req, res) => {
  const { username } = req.params;
  const { id: userId } = req.user;

  try {
    const user = await UserModel.getProfileByUsername(username, userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile fetched successfully", user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


