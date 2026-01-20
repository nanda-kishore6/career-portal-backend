import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import protectedRoutes from "./routes/protected.routes";
import opportunityRoutes from "./routes/opportunity.routes";
import applicationRoutes from "./routes/application.routes";
import bookmarkRoutes from "./routes/bookmark.routes";

const app = express();


app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like curl, Postman)
      if (!origin) return callback(null, true);

      // allow ONLY your frontend
      if (origin === process.env.FRONTEND_URL) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed"), false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// IMPORTANT: handle preflight explicitly
app.options("*", cors());


app.use(express.json());




app.get("/", (req, res) => {
  res.send("Career Opportunities Platform API is running 🚀");
});


app.use("/auth", authRoutes);
app.use("/protected", protectedRoutes);
app.use("/opportunities", opportunityRoutes);
app.use("/applications", applicationRoutes);
app.use("/bookmarks", bookmarkRoutes);

export default app;
