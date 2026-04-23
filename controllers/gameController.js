import * as GameModel from "../models/gameModel.js";

const RAWG_API_KEY = process.env.RAWG_API_KEY;

export const searchGames = async (req, res, next) => {
  try {
    const { search, page } = req.query;
    let url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&page_size=20`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    if (page) {
      url += `&page=${encodeURIComponent(page)}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
        return res.status(response.status).json({ message: "Error fetching games from RAWG" });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const response = await fetch(`https://api.rawg.io/api/genres?key=${RAWG_API_KEY}`);
    if (!response.ok) {
        return res.status(response.status).json({ message: "Error fetching genres from RAWG" });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { game_id, game_name, game_image, rating, description } = req.body;
    const user_id = req.user.id;

    if (!game_id || !game_name || rating === undefined || rating < 0 || rating > 100) {
        return res.status(400).json({ message: "Invalid review data" });
    }

    const reviewId = await GameModel.createReview({
      user_id,
      game_id,
      game_name,
      game_image,
      rating,
      description
    });

    res.status(201).json({ message: "Review created successfully", reviewId });
  } catch (error) {
    next(error);
  }
};

export const getUserReviews = async (req, res, next) => {
  try {
    const { username } = req.params;
    const limit = parseInt(req.query.limit, 10) || 10;
    const cursor = req.query.cursor;

    const reviews = await GameModel.getUserReviews(username, limit, cursor);

    let nextCursor = null;
    if (reviews.length === limit) {
      nextCursor = reviews[reviews.length - 1].id;
    }

    res.json({ reviews, nextCursor });
  } catch (error) {
    next(error);
  }
};
