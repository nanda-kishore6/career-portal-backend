import { pool } from "../config/db";
import { redisClient } from "../config/redis";

interface CreateOpportunityInput {
  title: string;
  description: string;
  category: string;
  status: string;
  deadline: string;
  organization: string;
  created_by: string;
  apply_link?: string;
  organization_logo?: string;
  type?: string;
  eligibility?: string;
  expires_at?: string;
}

/* =========================
   CREATE OPPORTUNITY
   (STEP 5: CACHE INVALIDATION)
   ========================= */

export const createOpportunityService = async (
  data: CreateOpportunityInput
) => {
  const result = await pool.query(
    `INSERT INTO opportunities (
      id,
      title,
      description,
      category,
      status,
      deadline,
      organization,
      created_by,
      apply_link,
      organization_logo,
      type,
      eligibility,
      expires_at
    )
    VALUES (
      gen_random_uuid(),
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
    )
    RETURNING *`,
    [
      data.title,
      data.description,
      data.category,
      data.status,
      data.deadline,
      data.organization,
      data.created_by,
      data.apply_link ?? null,
      data.organization_logo ?? null,
      data.type ?? null,
      data.eligibility ?? null,
      data.expires_at ?? null
    ]
  );

  // 🔥 STEP 5: Invalidate cached opportunity lists
  await redisClient.del("opportunities:*");

  return result.rows[0];
};

/* =========================
   PAGINATED FETCH
   (STEP 4: REDIS CACHING)
   ========================= */

export const getActiveOpportunitiesService = async (
  userId: string,
  search?: string,
  category?: string,
  page: number = 1,
  limit: number = 10
) => {
  const offset = (page - 1) * limit;

  // 🔑 Redis Cache Key
  const cacheKey = `opportunities:user:${userId}:search:${search || "none"}:category:${category || "all"}:page:${page}:limit:${limit}`;

  // 1️⃣ Check Redis first
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    return JSON.parse(cachedData);
  }

  /* =========================
     COUNT QUERY
     ========================= */

  let countQuery = `
    SELECT COUNT(DISTINCT o.id)
    FROM opportunities o
    WHERE o.status = 'ACTIVE'
  `;

  const countValues: any[] = [];

  if (search) {
    countValues.push(`%${search}%`);
    countQuery += `
      AND (
        o.title ILIKE $${countValues.length}
        OR o.organization ILIKE $${countValues.length}
      )
    `;
  }

  if (category) {
    countValues.push(category.toUpperCase());
    countQuery += `
      AND o.category = $${countValues.length}
    `;
  }

  const countResult = await pool.query(countQuery, countValues);
  const totalCount = parseInt(countResult.rows[0].count, 10);

  /* =========================
     DATA QUERY
     ========================= */

  let dataQuery = `
    SELECT
      o.*,
      CASE
        WHEN b.id IS NOT NULL THEN true
        ELSE false
      END AS "isBookmarked",
      CASE
        WHEN a.id IS NOT NULL THEN true
        ELSE false
      END AS "isApplied"
    FROM opportunities o
    LEFT JOIN bookmarks b
      ON b.opportunity_id = o.id
      AND b.user_id = $1
    LEFT JOIN applications a
      ON a.opportunity_id = o.id
      AND a.user_id = $1
    WHERE o.status = 'ACTIVE'
  `;

  const dataValues: any[] = [userId];

  if (search) {
    dataValues.push(`%${search}%`);
    dataQuery += `
      AND (
        o.title ILIKE $${dataValues.length}
        OR o.organization ILIKE $${dataValues.length}
      )
    `;
  }

  if (category) {
    dataValues.push(category.toUpperCase());
    dataQuery += `
      AND o.category = $${dataValues.length}
    `;
  }

  dataQuery += `
    ORDER BY o.created_at DESC
    LIMIT $${dataValues.length + 1}
    OFFSET $${dataValues.length + 2}
  `;

  dataValues.push(limit, offset);

  const dataResult = await pool.query(dataQuery, dataValues);

  const response = {
    opportunities: dataResult.rows,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };

  // 2️⃣ Store in Redis (TTL = 60 seconds)
  await redisClient.setEx(cacheKey, 60, JSON.stringify(response));

  return response;
};

/* =========================
   GET BY ID
   ========================= */

export const getOpportunityByIdService = async (id: string) => {
  const { rows } = await pool.query(
    "SELECT * FROM opportunities WHERE id = $1",
    [id]
  );
  return rows[0];
};

/* =========================
   UPDATE OPPORTUNITY
   (STEP 5: CACHE INVALIDATION)
   ========================= */

export const updateOpportunityService = async (
  id: string,
  data: any
) => {
  const {
    title,
    description,
    category,
    status,
    deadline,
    organization,
    apply_link,
    organization_logo,
  } = data;

  const { rows } = await pool.query(
    `
    UPDATE opportunities
    SET
      title = $1,
      description = $2,
      category = $3,
      status = $4,
      deadline = $5,
      organization = $6,
      apply_link = $7,
      organization_logo = $8
    WHERE id = $9
    RETURNING *
    `,
    [
      title,
      description,
      category,
      status,
      deadline,
      organization,
      apply_link ?? null,
      organization_logo ?? null,
      id,
    ]
  );

  // 🔥 Invalidate cache
  await redisClient.del("opportunities:*");

  return rows[0];
};

/* =========================
   DELETE OPPORTUNITY
   (STEP 5: CACHE INVALIDATION)
   ========================= */

export const deleteOpportunityService = async (id: string) => {
  await pool.query("DELETE FROM opportunities WHERE id = $1", [id]);

  // 🔥 Invalidate cache
  await redisClient.del("opportunities:*");
};
