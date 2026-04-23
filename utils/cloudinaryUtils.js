import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const uploadFromBuffer = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

export const deleteFile = async (id) => {
  try {
    const result = await cloudinary.uploader.destroy(id);
    return result;
  } catch (error) {
    console.error("Error while deleting file:", error);
    throw error;
  }
};
