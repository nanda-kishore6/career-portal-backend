import { pool } from "../config/db";

interface ApplyInput {
  user_id: string;
  opportunity_id: string;
}

export const applyToOpportunityService = async (
  data: ApplyInput
) => {
  // 1. Ensure opportunity is ACTIVE
  const opportunityCheck = await pool.query(
    `SELECT id FROM opportunities
     WHERE id = $1 AND status = 'ACTIVE'`,
    [data.opportunity_id]
  );

  if (opportunityCheck.rows.length === 0) {
    throw new Error("Opportunity not found or not active");
  }

  // 2. Insert application
  const result = await pool.query(
    `INSERT INTO applications (
      id,
      user_id,
      opportunity_id,
      status,
      applied_at
    )
    VALUES (
      gen_random_uuid(),
      $1, $2, 'APPLIED', NOW()
    )
    RETURNING *`,
    [data.user_id, data.opportunity_id]
  );

  return result.rows[0];
};
export const getMyApplicationsService = async (userId: string) => {
  const { rows } = await pool.query(
    `
    SELECT 
      a.id,
      a.status,
      a.applied_at,
      o.id AS opportunity_id,
      o.title,
      o.organization
    FROM applications a
    JOIN opportunities o ON o.id = a.opportunity_id
    WHERE a.user_id = $1
    ORDER BY a.applied_at DESC
    `,
    [userId]
  );

  return rows;
};
export const updateApplicationStatusService = async (
  applicationId: string,
  userId: string,
  status: string
) => {
  const { rows } = await pool.query(
    `
    UPDATE applications
    SET status = $1
    WHERE id = $2 AND user_id = $3
    RETURNING *
    `,
    [status, applicationId, userId]
  );

  if (rows.length === 0) {
    throw new Error("Application not found");
  }

  return rows[0];
};
