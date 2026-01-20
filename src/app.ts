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
       origin: process.env.FRONTEND_URL!,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    
  })
);


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
