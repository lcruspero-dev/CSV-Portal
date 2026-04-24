const express = require("express");
const { errorHandler } = require("./middleware/errorMiddleware");
const connectDB = require("./config/db");
const PORT = process.env.PORT;
const cors = require("cors");

connectDB();

require("./jobs/leaveAccrualJob.js");
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
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/tickets", require("./routes/ticketRoutes"));
app.use("/api/memos", require("./routes/memoRoutes"));
app.use("/api/policies", require("./routes/policiesRoute"));
app.use("/api/assigns", require("./routes/assignRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/employeeTimes", require("./routes/employeeTimeRoutes"));
app.use(
  "/api/ScheduleAndAttendanceRoutes",
  require("./routes/ScheduleAndAttendanceRoutes")
);
app.use("/api/surveys", require("./routes/surveyRoutes"));
app.use("/api/ntes", require("./routes/nteRoutes"));
app.use("/api/coaching", require("./routes/coachingRoutes"));
app.use("/api/userprofiles", require("./routes/userProfileRoutes"));
app.use("/api/leave", require("./routes/leaveRoutes"));
app.use("/api/payroll", require("./routes/payrollRoute.js"));


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
