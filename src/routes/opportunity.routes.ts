import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  createOpportunity,
  getActiveOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
} from "../controllers/opportunity.controller";

const router = Router();

// ADMIN
router.post("/", authenticate, createOpportunity);
router.put("/:id", authenticate, updateOpportunity);
router.delete("/:id", authenticate, deleteOpportunity);

// USERS
router.get("/", authenticate, getActiveOpportunities);
router.get("/:id", authenticate, getOpportunityById);

export default router;
