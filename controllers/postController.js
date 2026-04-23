import { uploadFromBuffer, deleteFile } from "../utils/cloudinaryUtils.js";
import * as PostModel from "../models/postModel.js";
import * as CommentModel from "../models/commentModel.js";
import * as NotificationModel from "../models/notificationModel.js";
import { handlePaginatedRequest } from "../utils/handlePaginatedRequest.js";

export const getPosts = async (req, res) => {
  const { id: userId } = req.user;
  const { game_id, category } = req.query;

  const filters = {};
  if (game_id) filters.game_id = game_id;
  if (category) filters.category = category;

  const modelCall = (limit, cursor) =>
    PostModel.getPosts(limit, cursor, userId, filters);

  await handlePaginatedRequest(req, res, "posts", modelCall);
};

export const getUserPosts = async (req, res) => {
  const { id: userId } = req.user;
  const { username } = req.params;

  const modelCall = (limit, cursor) =>
    PostModel.getPostsByUsername(limit, cursor, userId, username);

  await handlePaginatedRequest(req, res, "posts", modelCall);
};

export const getBookmarkedPosts = async (req, res) => {
  const { id: userId } = req.user;

  const modelCall = (limit, cursor) =>
    PostModel.getBookmarkedPosts(limit, cursor, userId);

  await handlePaginatedRequest(req, res, "posts", modelCall);
};

export const getPostById = async (req, res) => {
  const { postId } = req.params;
  const { id: userId } = req.user;

  try {
    const post = await PostModel.getPostById(postId, userId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ post });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Error fetching post" });
  }
};

export const createPost = async (req, res) => {
  const { caption, tags } = req.body;
  const imageFile = req.file;
  const { id: userId } = req.user;

  if (!imageFile) {
    return res.status(400).json({ message: "No image file provided." });
  }

  let parsedTags = null;
  if (tags) {
    try {
      parsedTags = JSON.parse(tags);
    } catch (e) {
      return res.status(400).json({ message: "Invalid tags format." });
    }
  }

  let publicId;

  try {
    const uploadResult = await uploadFromBuffer(imageFile.buffer, "posts");
    const imageUrl = uploadResult.secure_url;
    publicId = uploadResult.public_id;

    const post = {
      user_id: userId,
      caption,
      image_url: imageUrl,
      image_cloudinary_id: publicId,
      tags: parsedTags ? JSON.stringify(parsedTags) : null,
    };

    const newPostId = await PostModel.createPost(post);
    const newPost = await PostModel.getPostById(newPostId, userId);

    if (!newPost) {
      throw new Error("Failed to retrieve the newly created post.");
    }

    res.status(201).json({
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    console.error("Error uploading image:", error);

    if (publicId) {
      try {
        await deleteFile(publicId);
      } catch (deleteError) {
        console.error("Error deleting image from Cloudinary:", deleteError);
      }
    }

    res.status(500).json({ message: "Error creating post" });
  }
};

export const deletePost = async (req, res) => {
  const { postId } = req.params;
  const { id: userId } = req.user;

  try {
    const post = await PostModel.getPostById(postId, userId);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (post.user.id !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this post." });
    }

    await deleteFile(post.image_cloudinary_id);
    await PostModel.deletePost(postId, userId);

    res.status(200).json({ message: "Post deleted successfully." });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Error deleting post." });
  }
};

export const likePost = async (req, res) => {
  const { postId } = req.params;
  const { id: userId } = req.user;

  try {
    const post = await PostModel.getPostById(postId, userId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const recipient_user_id = post.user.id;

    const result = await PostModel.addLike(postId, userId);

    if (recipient_user_id !== userId) {
      await NotificationModel.createNotification({
        type: "like",
        sender_user_id: userId,
        recipient_user_id,
        post_id: postId,
      });
    }

    res.status(201).json({ message: "Post liked successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(200).json({ message: "The post is already liked." });
    }
    console.error("Error liking post:", error);
    res.status(500).json({ message: "Error liking post" });
  }
};

export const unlikePost = async (req, res) => {
  const { postId } = req.params;
  const { id: userId } = req.user;

  try {
    const result = await PostModel.removeLike(postId, userId);

    if (!result) {
      return res.status(200).json({ message: "Post was not liked" });
    }

    res.status(200).json({ message: "Post unliked successfully" });
  } catch (error) {
    console.error("Error unliking post:", error);
    res.status(500).json({ message: "Error unliking post" });
  }
};

export const bookmarkPost = async (req, res) => {
  const { postId } = req.params;
  const { id: userId } = req.user;

  try {
    const result = await PostModel.addBookmark(postId, userId);
    res.status(201).json({ message: "Post bookmarked successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(200)
        .json({ message: "The post is already bookmarked." });
    } else if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(404).json({ message: "Post not found." });
    }
    console.error("Error bookmarking post:", error);
    res.status(500).json({ message: "Error bookmarking post" });
  }
};

export const unbookmarkPost = async (req, res) => {
  const { postId } = req.params;
  const { id: userId } = req.user;

  try {
    const result = await PostModel.removeBookmark(postId, userId);

    if (!result) {
      return res.status(200).json({ message: "Post was not bookmarked" });
    }

    res.status(200).json({ message: "Post unbookmarked successfully" });
  } catch (error) {
    console.error("Error unbookmarking post:", error);
    res.status(500).json({ message: "Error unbookmarking post" });
  }
};

export const getComments = async (req, res) => {
  const { postId } = req.params;

  const modelCall = (limit, cursor) =>
    CommentModel.getCommentsByPostId(limit, cursor, postId);

  await handlePaginatedRequest(req, res, "comments", modelCall);
};

export const addComment = async (req, res) => {
  const { postId } = req.params;
  const { comment_text } = req.body;
  const { id: userId } = req.user;

  try {
    const post = await PostModel.getPostById(postId, userId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }
    const recipient_user_id = post.user.id;

    const comment = {
      user_id: userId,
      post_id: postId,
      comment_text,
    };

    const newCommentId = await CommentModel.createComment(comment);
    const newComment = await CommentModel.getCommentById(newCommentId);

    if (!newComment) {
      throw new Error("Failed to retrieve the newly created comment.");
    }

    if (recipient_user_id !== userId) {
      await NotificationModel.createNotification({
        type: "comment",
        sender_user_id: userId,
        recipient_user_id,
        post_id: postId,
      });
    }

    res.status(201).json({
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Error adding comment" });
  }
};
