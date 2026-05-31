import db from "../config/database.js";

const _getPostsBase = async (
  whereClause,
  whereParams,
  limit,
  cursor,
  currentUserId
) => {
  let baseQuery = `
    SELECT
      p.id, p.image_url, p.caption, p.created_at, p.image_cloudinary_id,
      p.tags,
      json_build_object(
        'id', u.id, 'name', u.name, 'username', u.username, 'profile_picture_url', u.profile_picture_url
      ) AS user,
      (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count,
      EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) AS is_liked,
      EXISTS(SELECT 1 FROM bookmarks WHERE post_id = p.id AND user_id = ?) AS is_bookmarked
    FROM
      posts p
    JOIN
      users u ON p.user_id = u.id
  `;

  const queryParams = [currentUserId, currentUserId, ...whereParams];

  const whereConditions = [];
  if (whereClause) {
    whereConditions.push(whereClause);
  }
  if (cursor) {
    whereConditions.push("p.id < ?");
    queryParams.push(cursor);
  }

  if (whereConditions.length > 0) {
    baseQuery += ` WHERE ${whereConditions.join(" AND ")}`;
  }

  baseQuery += ` ORDER BY p.created_at DESC, p.id DESC`;

  if (limit) {
    baseQuery += " LIMIT ?";
    queryParams.push(parseInt(limit, 10));
  }

  const [rows] = await db.query(baseQuery, queryParams);
  const posts = rows.map((post) => ({
    ...post,
    is_liked: !!post.is_liked,
    is_bookmarked: !!post.is_bookmarked,
  }));

  return posts;
};

export const getPosts = async (limit, cursor, currentUserId, filters = {}) => {
  let whereClause = null;
  let whereParams = [];

  const conditions = [];
  if (filters.game_id) {
    conditions.push("p.tags @> json_build_object('gameId', ?::numeric)::jsonb");
    whereParams.push(Number(filters.game_id));
  }
  if (filters.category) {
    conditions.push("p.tags @> json_build_object('category', ?::text)::jsonb");
    whereParams.push(filters.category);
  }

  if (conditions.length > 0) {
    whereClause = conditions.join(" AND ");
  }

  return _getPostsBase(whereClause, whereParams, limit, cursor, currentUserId);
};

export const getPostsByUsername = async (
  limit,
  cursor,
  currentUserId,
  username
) => {
  const whereClause = "u.username = ?";
  const whereParams = [username];
  return _getPostsBase(whereClause, whereParams, limit, cursor, currentUserId);
};

export const getBookmarkedPosts = async (limit, cursor, currentUserId) => {
  const whereClause =
    "EXISTS(SELECT 1 FROM bookmarks WHERE post_id = p.id AND user_id = ?)";
  const whereParams = [currentUserId];
  return _getPostsBase(whereClause, whereParams, limit, cursor, currentUserId);
};

export const getPostById = async (postId, currentUserId) => {
  const query = `
    SELECT
      p.id, p.image_url, p.caption, p.created_at, p.image_cloudinary_id,
      p.tags,
      json_build_object(
        'id', u.id, 'name', u.name, 'username', u.username, 'profile_picture_url', u.profile_picture_url
      ) AS user,
      (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count,
      EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) AS is_liked,
      EXISTS(SELECT 1 FROM bookmarks WHERE post_id = p.id AND user_id = ?) AS is_bookmarked
    FROM
      posts p
    JOIN
      users u ON p.user_id = u.id
    WHERE
      p.id = ?;
  `;

  const [rows] = await db.query(query, [currentUserId, currentUserId, postId]);

  if (rows.length === 0) {
    return null;
  }

  const post = {
    ...rows[0],
    is_liked: !!rows[0].is_liked,
    is_bookmarked: !!rows[0].is_bookmarked,
  };

  return post;
};

export const createPost = async (post) => {
  const { user_id, caption, image_url, image_cloudinary_id, tags } = post;

  const [rows] = await db.query(
    `INSERT INTO posts (user_id, caption, image_url, image_cloudinary_id, tags)
        VALUES (?, ?, ?, ?, ?) RETURNING id`,
    [user_id, caption, image_url, image_cloudinary_id, tags || null]
  );

  return rows[0].id;
};

export const deletePost = async (postId, userId) => {
  const [result] = await db.query(
    "DELETE FROM posts WHERE id = ? AND user_id = ?",
    [postId, userId]
  );

  return result.affectedRows > 0;
};

export const addLike = async (postId, userId) => {
  const [result] = await db.query(
    "INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)",
    [postId, userId]
  );

  return result.affectedRows > 0;
};

export const removeLike = async (postId, userId) => {
  const [result] = await db.query(
    "DELETE FROM post_likes WHERE post_id = ? AND user_id = ?",
    [postId, userId]
  );

  return result.affectedRows > 0;
};

export const addBookmark = async (postId, userId) => {
  const [result] = await db.query(
    "INSERT INTO bookmarks (post_id, user_id) VALUES (?, ?)",
    [postId, userId]
  );

  return result.affectedRows > 0;
};

export const removeBookmark = async (postId, userId) => {
  const [result] = await db.query(
    "DELETE FROM bookmarks WHERE post_id = ? AND user_id = ?",
    [postId, userId]
  );

  return result.affectedRows > 0;
};
