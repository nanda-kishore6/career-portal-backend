import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createOpportunityService } from "../services/opportunity.service";
import { getActiveOpportunitiesService } from "../services/opportunity.service";
import { getOpportunityByIdService } from "../services/opportunity.service";
import { updateOpportunityService } from "../services/opportunity.service";
import { deleteOpportunityService } from "../services/opportunity.service";

export const createOpportunity = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    // ADMIN only
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({
        message: "Only ADMIN can create opportunities"
      });
    }

    const {
      title,
      description,
      category,
      status,
      deadline,
      organization,
      apply_link,
      organization_logo,
      type,
      eligibility,
      expires_at
    } = req.body;

    // Required fields (based on DB)
    if (
      !title ||
      !description ||
      !category ||
      !status ||
      !deadline ||
      !organization
    ) {
      return res.status(400).json({
        message:
          "title, description, category, status, deadline, and organization are required"
      });
    }

    const opportunity = await createOpportunityService({
      title,
      description,
      category: category.toUpperCase(),
      status: status.toUpperCase(),
      deadline,
      organization,
      created_by: req.user.id,
      apply_link,
      organization_logo,
      type,
      eligibility,
      expires_at
    });

    return res.status(201).json({
      message: "Opportunity created successfully",
      opportunity
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Failed to create opportunity"
    });
  }
};
export const getActiveOpportunities = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const search =
      typeof req.query.search === "string"
        ? req.query.search
        : undefined;

    const category =
      typeof req.query.category === "string"
        ? req.query.category
        : undefined;

    const page =
  typeof req.query.page === "string"
    ? parseInt(req.query.page, 10)
    : 1;

 const limit =
  typeof req.query.limit === "string"
    ? parseInt(req.query.limit, 10)
    : 10;


    const opportunities = await getActiveOpportunitiesService(
  req.user.id,
  search,
  category,
  page,
  limit
);


return res.status(200).json(opportunities);

  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Failed to fetch opportunities",
    });
  }
};


export const getOpportunityById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    const opportunity = await getOpportunityByIdService(id);

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    return res.status(200).json({ opportunity });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Failed to fetch opportunity",
    });
  }
};
export const updateOpportunity = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;

    const updated = await updateOpportunityService(id, req.body);

    return res.status(200).json({
      message: "Opportunity updated",
      opportunity: updated,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Failed to update opportunity",
    });
  }
};
export const deleteOpportunity = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;

    await deleteOpportunityService(id);

    return res.status(200).json({
      message: "Opportunity deleted",
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Failed to delete opportunity",
    });
  }
};


