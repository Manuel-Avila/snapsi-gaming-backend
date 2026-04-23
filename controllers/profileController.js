import * as UserModel from "../models/userModel.js";
import { deleteFile, uploadFromBuffer } from "../utils/cloudinaryUtils.js";

export const getProfile = async (req, res) => {
  const { username, id } = req.user;

  try {
    const user = await UserModel.getProfileByUsername(username, id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile fetched successfully", user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

export const updateProfile = async (req, res) => {
  const { id: userId } = req.user;
  const imageFile = req.file;
  const { name, bio } = req.body;
  let profile_picture_url;
  let image_cloudinary_id;

  try {
    if (imageFile) {
      const uploadResult = await uploadFromBuffer(
        imageFile.buffer,
        "profile_pictures"
      );
      profile_picture_url = uploadResult.secure_url;
      image_cloudinary_id = uploadResult.public_id;
    }

    const currentUser = await UserModel.getUserById(userId);

    const updatedData = {
      name,
      bio,
      profile_picture_url,
      image_cloudinary_id,
    };

    const success = await UserModel.updateUser(userId, updatedData);

    if (!success) {
      return res
        .status(404)
        .json({ message: "User not found or no changes made" });
    }

    if (currentUser.profile_picture_url && imageFile) {
      await deleteFile(currentUser.image_cloudinary_id);
    }

    res.status(200).json({
      message: "Profile updated successfully",
      updatedData: {
        name,
        bio,
        profile_picture_url,
      },
    });
  } catch (error) {
    if (image_cloudinary_id) {
      try {
        await deleteFile(image_cloudinary_id);
      } catch (error) {
        console.error("Error deleting new profile picture:", error);
      }
    }

    res.status(500).json({ message: "Error updating profile" });
  }
};
