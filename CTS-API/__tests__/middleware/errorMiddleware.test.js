const errorMiddleware = require("../../middleware/errorMiddleware");

describe("Error Middleware", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    console.log = jest.fn();
  });

  test("should handle error with custom status code", () => {
    const error = new Error("Custom error");
    error.status = 400;

    errorMiddleware(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Custom error",
      status: 400,
    });
  });

  test("should default to 500 status if not provided", () => {
    const error = new Error("Server error");

    errorMiddleware(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Server error",
      status: 500,
    });
  });

  test("should log error to console", () => {
    const error = new Error("Test error");
    error.status = 500;

    errorMiddleware(error, mockReq, mockRes, mockNext);

    expect(console.log).toHaveBeenCalled();
  });

  test("should handle errors without message property", () => {
    const error = {};
    error.status = 400;

    errorMiddleware(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  test("should handle 401 Unauthorized errors", () => {
    const error = new Error("Unauthorized");
    error.status = 401;

    errorMiddleware(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Unauthorized",
      status: 401,
    });
  });

  test("should handle 404 Not Found errors", () => {
    const error = new Error("Resource not found");
    error.status = 404;

    errorMiddleware(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Resource not found",
      status: 404,
    });
  });
});
