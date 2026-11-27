// ============================================================
// Cell 1: Imports
// Express, the route files and the middleware.
// ============================================================
import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import homeRoutes from "./routes/homeRoutes.js";
import studentroutes from "./routes/studentroutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import { logger } from "./middleware/logger.js";


// ============================================================
// Cell 2: Create the app and middleware
// These run on every request, before the routes.
// cors lets the page on port 8080 call this server.
// ============================================================
const app = express();
app.use(cors({ origin: ["http://127.0.0.1:8080", "http://localhost:8080"] }));
app.use(logger);
app.use(express.json()); // reads JSON into req.body


// ============================================================
// Cell 3: Routes
// Which route file answers which address.
// ============================================================
app.use("/", homeRoutes);
app.use("/students", studentroutes);
app.use("/contact", contactRoutes);


// ============================================================
// Cell 4: Error handler
// Anything thrown above ends up here. Details stay in the
// terminal; the visitor gets a short message.
// ============================================================
app.use((error: Error & { status?: number }, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  const status = error.status && error.status < 500 ? error.status : 500;
  res.status(status).json({ error: status === 500 ? "Server error. Check the backend terminal." : "Bad request" });
});


// ============================================================
// Cell 5: Start the server
// 127.0.0.1 means only this computer can reach it. There is no
// login yet, so it should not be open to the network.
// ============================================================
app.listen(3000, "127.0.0.1", () => {
  console.log("Open http://localhost:3000");
});
