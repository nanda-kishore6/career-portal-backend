import bcrypt from "bcrypt";
import { pool } from "../config/db";
import { generateToken } from "../utils/jwt";

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: "STUDENT" | "ADMIN",
  college?: string
) => {
  // Check if user already exists
  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user (MATCHES DB EXACTLY)
  const result = await pool.query(
    `INSERT INTO users (id, name, email, password_hash, role, college)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
     RETURNING id, name, email, role, college`,
    [name, email, hashedPassword, role, college ?? null]
  );

  return result.rows[0];
};



export const loginUser = async (
  email: string,
  password: string
) => {
  // 1. Find user
  const result = await pool.query(
    `SELECT id, name, email, password_hash, role, college
     FROM users
     WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = result.rows[0];

  // 2. Compare password
  const isMatch = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // 3. Generate JWT
  const token = generateToken({
    id: user.id,
    role: user.role
  });

  // 4. Remove sensitive data
  delete user.password_hash;

  return {
    token,
    user
  };
};
