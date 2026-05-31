import db from "../config/database.js";

export const createReview = async (review) => {
  const { user_id, game_id, game_name, game_image, rating, description } = review;

  const [rows] = await db.query(
    `INSERT INTO game_reviews (user_id, game_id, game_name, game_image, rating, description)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT (user_id, game_id) DO UPDATE SET
       rating = EXCLUDED.rating,
       description = EXCLUDED.description,
       game_image = EXCLUDED.game_image,
       game_name = EXCLUDED.game_name
     RETURNING id`,
    [user_id, game_id, game_name, game_image, rating, description]
  );

  return rows[0].id;
};

export const getReviewByUserAndGame = async (user_id, game_id) => {
  const [rows] = await db.query(
    `SELECT
      gr.id, gr.game_id, gr.game_name, gr.game_image, gr.rating, gr.description, gr.created_at,
      json_build_object(
        'id', u.id, 'name', u.name, 'username', u.username, 'profile_picture_url', u.profile_picture_url
      ) AS user
    FROM game_reviews gr
    JOIN users u ON gr.user_id = u.id
    WHERE gr.user_id = ? AND gr.game_id = ?`,
    [user_id, game_id]
  );
  return rows[0];
};

export const getUserReviews = async (username, limit, cursor) => {
  let baseQuery = `
    SELECT
      gr.id, gr.game_id, gr.game_name, gr.game_image, gr.rating, gr.description, gr.created_at,
      json_build_object(
        'id', u.id, 'name', u.name, 'username', u.username, 'profile_picture_url', u.profile_picture_url
      ) AS user
    FROM
      game_reviews gr
    JOIN
      users u ON gr.user_id = u.id
    WHERE u.username = ?
  `;

  const queryParams = [username];

  if (cursor) {
    baseQuery += " AND gr.id < ?";
    queryParams.push(cursor);
  }

  baseQuery += ` ORDER BY gr.created_at DESC, gr.id DESC`;

  if (limit) {
    baseQuery += " LIMIT ?";
    queryParams.push(parseInt(limit, 10));
  }

  const [rows] = await db.query(baseQuery, queryParams);
  return rows;
};
