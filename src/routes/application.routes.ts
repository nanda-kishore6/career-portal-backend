import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { applyToOpportunity } from "../controllers/application.controller";
import { getMyApplications } from "../controllers/application.controller";
import { updateApplicationStatus } from "../controllers/application.controller";

const router = Router();

// STUDENT apply
router.post("/:opportunityId", authenticate, applyToOpportunity);
router.get("/", authenticate, getMyApplications);
router.patch("/:applicationId", authenticate, updateApplicationStatus);

export default router;
