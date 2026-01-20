import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { AuthRequest } from "../middlewares/auth.middleware";

const router = Router();

router.get("/profile", authenticate, (req: AuthRequest, res) => {
  return res.status(200).json({
    message: "Protected route accessed successfully",
    user: req.user
  });
});

export default router;
