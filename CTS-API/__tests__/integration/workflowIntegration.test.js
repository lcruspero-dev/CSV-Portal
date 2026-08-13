/**
 * Integration Tests
 * Tests for complete workflows involving multiple components
 */

const userController = require("../../controllers/userController");
const employeeTimeController = require("../../controllers/employeeTimeController");
const User = require("../../models/userModel");
const EmployeeTime = require("../../models/employeeTimeModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

jest.mock("../../models/userModel");
jest.mock("../../models/employeeTimeModel");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("Integration Tests - User and Time Tracking Workflow", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      user: {},
      body: {},
      params: {},
      query: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  describe("Complete User Registration and Login Workflow", () => {
    test("should register user and then login successfully", async () => {
      // Step 1: Register user
      const registerReq = {
        body: {
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
        },
      };

      const registerRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      bcrypt.genSalt.mockResolvedValue("salt");
      bcrypt.hash.mockResolvedValue("hashedpassword123");
      User.findOne.mockResolvedValue(null);
      const newUser = {
        _id: "user123",
        name: "John Doe",
        email: "john@example.com",
        isAdmin: false,
        role: "user",
      };
      User.create.mockResolvedValue(newUser);
      jwt.sign.mockReturnValue("token123");

      await userController.registerUser(registerReq, registerRes);

      expect(registerRes.status).toHaveBeenCalledWith(201);
      expect(registerRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: "user123",
          email: "john@example.com",
        }),
      );

      // Step 2: Login with registered user
      const loginReq = {
        body: {
          email: "john@example.com",
          password: "password123",
        },
      };

      const loginRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const loginUser = {
        _id: "user123",
        name: "John Doe",
        email: "john@example.com",
        isAdmin: false,
        role: "user",
        status: "active",
        loginLimit: 1,
        password: "hashedpassword123",
      };

      User.findOne.mockResolvedValue(loginUser);
      bcrypt.compare.mockResolvedValue(true);

      await userController.loginUser(loginReq, loginRes);

      expect(loginRes.status).toHaveBeenCalledWith(200);
      expect(loginRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "john@example.com",
          token: "token123",
        }),
      );
    });
  });

  describe("Complete Time Tracking Workflow", () => {
    test("should create time-in and then time-out for same employee", async () => {
      const employeeId = "user123";
      const employeeName = "John Doe";

      // Step 1: Create time-in
      const timeInReq = {
        user: { _id: employeeId, name: employeeName },
        body: {
          date: "01/15/2026",
          timeIn: "09:00 AM",
          shift: "shift1",
          loginLimit: 1,
        },
      };

      const timeInRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const timeInRecord = {
        _id: "time123",
        employeeId,
        employeeName,
        date: "01/15/2026",
        timeIn: "09:00 AM",
        timeOut: null,
        shift: "shift1",
      };

      EmployeeTime.countDocuments.mockResolvedValue(0);
      EmployeeTime.create.mockResolvedValue(timeInRecord);

      await employeeTimeController.createEmployeeTimeIn(timeInReq, timeInRes);

      expect(timeInRes.status).toHaveBeenCalledWith(201);
      expect(timeInRes.json).toHaveBeenCalledWith(timeInRecord);

      // Step 2: Create time-out for same record
      const timeOutReq = {
        params: { id: "time123" },
        body: { timeOut: "05:00 PM" },
      };

      const timeOutRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const updatedRecord = {
        _id: "time123",
        employeeId,
        employeeName,
        date: "01/15/2026",
        timeIn: "09:00 AM",
        timeOut: "05:00 PM",
        shift: "shift1",
        save: jest.fn().mockResolvedValue(),
      };

      EmployeeTime.findById.mockResolvedValue(updatedRecord);

      await employeeTimeController.createEmployeeTimeOut(
        timeOutReq,
        timeOutRes,
      );

      expect(updatedRecord.timeOut).toBe("05:00 PM");
      expect(updatedRecord.save).toHaveBeenCalled();
      expect(timeOutRes.status).toHaveBeenCalledWith(200);
    });

    test("should prevent duplicate time-in on same day", async () => {
      const employeeId = "user123";

      // Step 1: Create first time-in
      const firstTimeInReq = {
        user: { _id: employeeId, name: "John Doe" },
        body: {
          date: "01/15/2026",
          timeIn: "09:00 AM",
          shift: "shift1",
          loginLimit: 1,
        },
      };

      const firstTimeInRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      EmployeeTime.countDocuments.mockResolvedValue(0);
      EmployeeTime.create.mockResolvedValue({
        _id: "time123",
        employeeId,
        date: "01/15/2026",
        timeIn: "09:00 AM",
      });

      await employeeTimeController.createEmployeeTimeIn(
        firstTimeInReq,
        firstTimeInRes,
      );

      expect(firstTimeInRes.status).toHaveBeenCalledWith(201);

      // Step 2: Attempt second time-in same day
      const secondTimeInReq = {
        user: { _id: employeeId, name: "John Doe" },
        body: {
          date: "01/15/2026",
          timeIn: "09:30 AM",
          shift: "shift1",
          loginLimit: 1,
        },
      };

      const secondTimeInRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      EmployeeTime.countDocuments.mockResolvedValue(1); // Already has one record

      await employeeTimeController.createEmployeeTimeIn(
        secondTimeInReq,
        secondTimeInRes,
      );

      expect(secondTimeInRes.status).toHaveBeenCalledWith(409);
      expect(secondTimeInRes.json).toHaveBeenCalledWith({
        message: "Duplicate entry: Time-in already recorded for this date.",
      });
    });
  });

  describe("Multi-day Time Tracking", () => {
    test("should allow time-in on different days for same employee", async () => {
      const employeeId = "user123";
      const employeeName = "John Doe";

      const days = ["01/14/2026", "01/15/2026", "01/16/2026"];

      for (const day of days) {
        const timeInReq = {
          user: { _id: employeeId, name: employeeName },
          body: {
            date: day,
            timeIn: "09:00 AM",
            shift: "shift1",
            loginLimit: 1,
          },
        };

        const timeInRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };

        EmployeeTime.countDocuments.mockResolvedValue(0);
        EmployeeTime.create.mockResolvedValue({
          _id: `time-${day}`,
          employeeId,
          employeeName,
          date: day,
          timeIn: "09:00 AM",
        });

        await employeeTimeController.createEmployeeTimeIn(timeInReq, timeInRes);

        expect(timeInRes.status).toHaveBeenCalledWith(201);
      }

      // Verify create was called 3 times (once per day)
      expect(EmployeeTime.create).toHaveBeenCalledTimes(3);
    });
  });

  describe("Error Recovery Workflow", () => {
    test("should handle and recover from failed time-in attempt", async () => {
      const employeeId = "user123";

      // Step 1: Failed time-in (database error)
      const failedReq = {
        user: { _id: employeeId, name: "John Doe" },
        body: {
          date: "01/15/2026",
          timeIn: "09:00 AM",
          shift: "shift1",
          loginLimit: 1,
        },
      };

      const failedRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      EmployeeTime.countDocuments.mockResolvedValue(0);
      EmployeeTime.create.mockRejectedValue(new Error("Database error"));

      await employeeTimeController.createEmployeeTimeIn(failedReq, failedRes);

      expect(failedRes.status).toHaveBeenCalledWith(500);

      // Step 2: Retry should succeed
      const retryRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      EmployeeTime.countDocuments.mockResolvedValue(0);
      EmployeeTime.create.mockResolvedValue({
        _id: "time123",
        employeeId,
        date: "01/15/2026",
        timeIn: "09:00 AM",
      });

      await employeeTimeController.createEmployeeTimeIn(failedReq, retryRes);

      expect(retryRes.status).toHaveBeenCalledWith(201);
    });
  });
});
