import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  bookmarkOpportunity,
  removeBookmark,
  listBookmarks
} from "../controllers/bookmark.controller";

const router = Router();

router.post("/:opportunityId", authenticate, bookmarkOpportunity);
router.delete("/:opportunityId", authenticate, removeBookmark);
router.get("/", authenticate, listBookmarks);

export default router;
