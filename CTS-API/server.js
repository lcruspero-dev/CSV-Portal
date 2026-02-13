import express from "express";
import { errorHandler } from "./middleware/errorMiddleware.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";

// Import routes
import userRoutes from "./routes/userRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import memoRoutes from "./routes/memoRoutes.js";
import policiesRoute from "./routes/policiesRoute.js";
import assignRoutes from "./routes/assignRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import employeeTimeRoutes from "./routes/employeeTimeRoutes.js";
import ScheduleAndAttendanceRoutes from "./routes/ScheduleAndAttendanceRoutes.js";
import surveyRoutes from "./routes/surveyRoutes.js";
import nteRoutes from "./routes/nteRoutes.js";
import coachingRoutes from "./routes/coachingRoutes.js";
import userProfileRoutes from "./routes/userProfileRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import payrollRoute from "./routes/payrollRoute.js";

// Import job
import "./jobs/leaveAccrualJob.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

const app = express();

app.use(express.json());

const corsOptions = {
  origin: "*",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

/**
 * This is a built-in middleware function in Express.
 * It parses incoming requests (Object as strings or arrays) with
 * urlencoded payloads and is based on body-parser.
 */
app.use(express.urlencoded({ extended: false }));

// Routes endpoints
app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/memos", memoRoutes);
app.use("/api/policies", policiesRoute);
app.use("/api/assigns", assignRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/employeeTimes", employeeTimeRoutes);
app.use("/api/ScheduleAndAttendanceRoutes", ScheduleAndAttendanceRoutes);
app.use("/api/surveys", surveyRoutes);
app.use("/api/ntes", nteRoutes);
app.use("/api/coaching", coachingRoutes);
app.use("/api/userprofiles", userProfileRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/payroll", payrollRoute);

// Serve frontend time
app.get("/api/current-time", (_req, res) => {
  const currentTime = new Date();
  res.json({
    date: currentTime.toLocaleDateString(),
    time: currentTime.toLocaleTimeString(),
  });
});

app.use(errorHandler);
app.disable("x-powered-by");

/**
 * app.listen()
 * Starts a UNIX socket and listens for connections on the given path.
 * This method is identical to Node’s http.Server.listen().
 */
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});