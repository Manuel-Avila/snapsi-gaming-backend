import db from "../config/database.js";

export const getNotificationsByUserId = async (
  limit,
  cursor,
  currentUserId
) => {
  let baseQuery = `
    SELECT 
        n.id, n.type, n.created_at, 
        JSON_OBJECT(
            'id', u.id,
            'username', u.username,
            'profile_picture_url', u.profile_picture_url
        ) AS sender,
        CASE 
            WHEN n.post_id IS NOT NULL THEN
                JSON_OBJECT(
                    'id', p.id,
                    'image_url', p.image_url
                )
            ELSE NULL
        END AS post
    FROM 
        notifications n
    JOIN
        users u ON n.sender_user_id = u.id
    LEFT JOIN 
        posts p ON n.post_id = p.id
    WHERE 
        n.recipient_user_id = ?
  `;

  const queryParams = [currentUserId];

  if (cursor) {
    baseQuery += ` AND n.id < ?`;
    queryParams.push(cursor);
  }

  baseQuery += `
    ORDER BY
        n.created_at DESC, n.id DESC
  `;

  if (limit) {
    baseQuery += ` LIMIT ?`;
    queryParams.push(parseInt(limit, 10));
  }

  const [rows] = await db.query(baseQuery, queryParams);
  return rows;
};

export const createNotification = async (notification) => {
  const { type, sender_user_id, recipient_user_id, post_id } = notification;

  const query = `
        INSERT INTO notifications (type, sender_user_id, recipient_user_id, post_id) VALUES (?, ?, ?, ?)
    `;

  const [result] = await db.query(query, [
    type,
    sender_user_id,
    recipient_user_id,
    post_id || null,
  ]);

  return result.insertId;
};
