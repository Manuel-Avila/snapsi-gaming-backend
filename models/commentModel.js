import db from "../config/database.js";

export const getCommentsByPostId = async (limit, cursor, postId) => {
  let baseQuery = `
    SELECT
      c.id, c.comment_text, c.created_at,
      JSON_OBJECT(
        'id', u.id,
        'name', u.name,
        'username', u.username,
        'profile_picture_url', u.profile_picture_url
      ) AS user
    FROM
      comments c
    JOIN
      users u ON c.user_id = u.id
    WHERE
      c.post_id = ?
  `;

  const queryParams = [postId];

  if (cursor) {
    baseQuery += ` AND c.id < ?`;
    queryParams.push(cursor);
  }

  baseQuery += `
    ORDER BY
      c.created_at DESC, c.id DESC
  `;

  if (limit) {
    baseQuery += ` LIMIT ?`;
    queryParams.push(parseInt(limit, 10));
  }

  const [rows] = await db.query(baseQuery, queryParams);
  return rows;
};

export const getCommentById = async (commentId) => {
  const query = `
    SELECT
      c.id, c.comment_text, c.created_at,
      JSON_OBJECT(
        'id', u.id,
        'name', u.name,
        'username', u.username,
        'profile_picture_url', u.profile_picture_url
      ) AS user
    FROM
      comments c
    JOIN
      users u ON c.user_id = u.id
    WHERE
      c.id = ?
  `;

  const [rows] = await db.query(query, [commentId]);

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
};

export const createComment = async (comment) => {
  const { user_id, post_id, comment_text } = comment;

  const [result] = await db.query(
    "INSERT INTO comments (user_id, post_id, comment_text) VALUES (?, ?, ?)",
    [user_id, post_id, comment_text]
  );

  return result.insertId;
};
