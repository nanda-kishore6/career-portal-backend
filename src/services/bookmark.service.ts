import { pool } from "../config/db";

interface BookmarkInput {
  user_id: string;
  opportunity_id: string;
}

export const bookmarkOpportunityService = async (
  data: BookmarkInput
) => {
  const result = await pool.query(
    `INSERT INTO bookmarks (
      id,
      user_id,
      opportunity_id,
      created_at
    )
    VALUES (
      gen_random_uuid(),
      $1, $2, NOW()
    )
    RETURNING *`,
    [data.user_id, data.opportunity_id]
  );

  return result.rows[0];
};

export const removeBookmarkService = async (
  data: BookmarkInput
) => {
  await pool.query(
    `DELETE FROM bookmarks
     WHERE user_id = $1 AND opportunity_id = $2`,
    [data.user_id, data.opportunity_id]
  );
};

export const listBookmarksService = async (userId: string) => {
  const result = await pool.query(
    `
    SELECT
      o.id,
      o.title,
      o.description,
      o.organization,
      o.organization_logo,
      o.category,
      o.type,
      o.deadline,
      o.apply_link,
      CASE
        WHEN a.id IS NOT NULL THEN true
        ELSE false
      END AS "isApplied"
    FROM bookmarks b
    JOIN opportunities o
      ON b.opportunity_id = o.id
    LEFT JOIN applications a
      ON a.opportunity_id = o.id
      AND a.user_id = $1
    WHERE b.user_id = $1
    ORDER BY b.created_at DESC
    `,
    [userId]
  );

  return result.rows;
};

