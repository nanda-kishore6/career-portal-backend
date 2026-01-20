import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  bookmarkOpportunityService,
  removeBookmarkService,
  listBookmarksService
} from "../services/bookmark.service";

export const bookmarkOpportunity = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== "STUDENT") {
      return res.status(403).json({
        message: "Only STUDENT can bookmark opportunities"
      });
    }

   const opportunityId = String(req.params.opportunityId);


    const bookmark = await bookmarkOpportunityService({
      user_id: req.user.id,
      opportunity_id: opportunityId
    });

    return res.status(201).json({
      message: "Opportunity bookmarked",
      bookmark
    });
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Opportunity already bookmarked"
      });
    }

    return res.status(400).json({
      message: error.message || "Failed to bookmark"
    });
  }
};

export const removeBookmark = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== "STUDENT") {
      return res.status(403).json({
        message: "Only STUDENT can remove bookmarks"
      });
    }

    const opportunityId = String(req.params.opportunityId);

    await removeBookmarkService({
      user_id: req.user.id,
      opportunity_id: opportunityId
    });

    return res.status(200).json({
      message: "Bookmark removed"
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Failed to remove bookmark"
    });
  }
};

export const listBookmarks = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== "STUDENT") {
      return res.status(403).json({
        message: "Only STUDENT can view bookmarks"
      });
    }

    const bookmarks = await listBookmarksService(req.user.id);

    return res.status(200).json({
      count: bookmarks.length,
      bookmarks
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Failed to fetch bookmarks"
    });
  }
};
