const employeeTimeController = require("../../controllers/employeeTimeController");
const EmployeeTime = require("../../models/employeeTimeModel");

jest.mock("../../models/employeeTimeModel");
jest.mock("../../controllers/payrollController");

describe("Employee Time Controller", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      user: { _id: "user123", name: "John Doe" },
      body: {},
      params: {},
      query: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("getEmployeeTimes", () => {
    test("should return all employee times", async () => {
      const mockTimes = [
        { _id: "1", employeeName: "John", date: "01/01/2026" },
        { _id: "2", employeeName: "Jane", date: "01/02/2026" },
      ];
      EmployeeTime.find.mockResolvedValue(mockTimes);

      await employeeTimeController.getEmployeeTimes(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockTimes);
    });

    test("should handle database errors", async () => {
      const error = new Error("Database error");
      EmployeeTime.find.mockRejectedValue(error);

      await employeeTimeController.getEmployeeTimes(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Database error" });
    });
  });

  describe("createEmployeeTimeIn", () => {
    test("should create employee time-in record", async () => {
      mockReq.body = {
        date: "01/15/2026",
        timeIn: "09:00 AM",
        shift: "shift1",
        loginLimit: 1,
      };

      const newRecord = {
        _id: "time123",
        employeeId: "user123",
        employeeName: "John Doe",
        date: "01/15/2026",
        timeIn: "09:00 AM",
        shift: "shift1",
      };

      EmployeeTime.countDocuments.mockResolvedValue(0);
      EmployeeTime.create.mockResolvedValue(newRecord);

      await employeeTimeController.createEmployeeTimeIn(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(newRecord);
    });

    test("should prevent duplicate time-in with loginLimit 1", async () => {
      mockReq.body = {
        date: "01/15/2026",
        timeIn: "09:00 AM",
        shift: "shift1",
        loginLimit: 1,
      };

      EmployeeTime.countDocuments.mockResolvedValue(1);

      await employeeTimeController.createEmployeeTimeIn(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Duplicate entry: Time-in already recorded for this date.",
      });
    });

    test("should prevent more than 2 time-ins with loginLimit 2", async () => {
      mockReq.body = {
        date: "01/15/2026",
        timeIn: "09:00 AM",
        shift: "shift1",
        loginLimit: 2,
      };

      EmployeeTime.countDocuments.mockResolvedValue(2);

      await employeeTimeController.createEmployeeTimeIn(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Maximum 2 time-ins allowed for this date and shift.",
      });
    });

    test("should handle creation errors", async () => {
      mockReq.body = {
        date: "01/15/2026",
        timeIn: "09:00 AM",
        shift: "shift1",
        loginLimit: 1,
      };

      const error = new Error("Database error");
      EmployeeTime.countDocuments.mockResolvedValue(0);
      EmployeeTime.create.mockRejectedValue(error);

      await employeeTimeController.createEmployeeTimeIn(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Database error" });
    });
  });

  describe("createEmployeeTimeOut", () => {
    test("should update employee time-out record", async () => {
      mockReq.params = { id: "time123" };
      mockReq.body = { timeOut: "05:00 PM" };

      const mockRecord = {
        _id: "time123",
        employeeId: "user123",
        timeIn: "09:00 AM",
        timeOut: null,
        save: jest.fn().mockResolvedValue(),
      };

      EmployeeTime.findById.mockResolvedValue(mockRecord);

      await employeeTimeController.createEmployeeTimeOut(mockReq, mockRes);

      expect(mockRecord.timeOut).toBe("05:00 PM");
      expect(mockRecord.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    test("should return 404 if record not found", async () => {
      mockReq.params = { id: "invalid" };
      mockReq.body = { timeOut: "05:00 PM" };

      EmployeeTime.findById.mockResolvedValue(null);

      await employeeTimeController.createEmployeeTimeOut(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Employee time not found",
      });
    });

    test("should handle save errors", async () => {
      mockReq.params = { id: "time123" };
      mockReq.body = { timeOut: "05:00 PM" };

      const mockRecord = {
        _id: "time123",
        timeOut: null,
        save: jest.fn().mockRejectedValue(new Error("Save error")),
      };

      EmployeeTime.findById.mockResolvedValue(mockRecord);

      await employeeTimeController.createEmployeeTimeOut(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
