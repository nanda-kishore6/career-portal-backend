import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { applyToOpportunityService } from "../services/application.service";

export const applyToOpportunity = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    // Only STUDENT can apply
    if (req.user?.role !== "STUDENT") {
      return res.status(403).json({
        message: "Only STUDENT can apply to opportunities"
      });
    }

    const { opportunityId } = req.params;

    if (!opportunityId) {
      return res.status(400).json({
        message: "Opportunity ID is required"
      });
    }

    const application = await applyToOpportunityService({
      user_id: req.user.id,
      opportunity_id: opportunityId
    });

    return res.status(201).json({
      message: "Application submitted successfully",
      application
    });
  } catch (error: any) {
    // Unique constraint violation (duplicate apply)
    if (error.code === "23505") {
      return res.status(409).json({
        message: "You have already applied to this opportunity"
      });
    }

    return res.status(400).json({
      message: error.message || "Failed to apply"
    });
  }
};
import { getMyApplicationsService } from "../services/application.service";

export const getMyApplications = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const applications = await getMyApplicationsService(req.user.id);

    return res.status(200).json({ applications });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Failed to fetch applications",
    });
  }
};
import { updateApplicationStatusService } from "../services/application.service";

export const updateApplicationStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { applicationId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const application = await updateApplicationStatusService(
      applicationId,
      req.user.id,
      status
    );

    return res.status(200).json({
      message: "Status updated",
      application,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Failed to update status",
    });
  }
};
