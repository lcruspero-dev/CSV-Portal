// Packages import
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Middleware import
import { errorHandler } from "./middleware/errorMiddleware.js";

// Database import
import connectDB from "./config/db.js";

//Main routes import
import userRoutes from "./routes/userRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import memosRoutes from "./routes/memoRoutes.js";
import policies from "./routes/policiesRoute.js";
import assignRoutes from "./routes/assignRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import employeeTimeRoutes from "./routes/employeeTimeRoutes.js";
import scheduleAndAttendanceRoutes from "./routes/ScheduleAndAttendanceRoutes.js";
import surveyRoutes from "./routes/surveyRoutes.js";
import nteRoutes from "./routes/nteRoutes.js";
import coachingRoutes from "./routes/coachingRoutes.js";
import userProfileRoutes from "./routes/userProfileRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import payrollRoutes from "./routes/payrollRoute.js";

// Leave accrual job
import leaveAccrualJob from "./jobs/leaveAccrualJob.js";


console.log("Starting server initialization...");

dotenv.config();
const PORT = process.env.PORT;

// Connect to database
connectDB();
leaveAccrualJob();

const app = express();
app.use(express.json());

const corsOptions = {
  origin: "*",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));

// Routes endpoints
app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/memos", memosRoutes);
app.use("/api/policies", policies);
app.use("/api/assigns", assignRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/employeeTimes", employeeTimeRoutes);
app.use("/api/ScheduleAndAttendanceRoutes", scheduleAndAttendanceRoutes);
app.use("/api/surveys", surveyRoutes);
app.use("/api/ntes", nteRoutes);
app.use("/api/coaching", coachingRoutes);
app.use("/api/userprofiles", userProfileRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/payroll", payrollRoutes);

// Server frontend time
app.get("/api/current-time", (_req, res) => {
  const currentTime = new Date();
  res.json({
    date: currentTime.toLocaleDateString(),
    time: currentTime.toLocaleTimeString(),
  });
});

app.use(errorHandler);
app.disable("x-powered-by");

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
