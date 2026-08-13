const authMiddleware = require("../../middleware/authMiddleware");
const jwt = require("jsonwebtoken");
const User = require("../../models/userModel");

jest.mock("jsonwebtoken");
jest.mock("../../models/userModel");

describe("Auth Middleware", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      user: null,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  test("should authenticate user with valid token", async () => {
    const token = "valid-token";
    const decodedToken = { id: "user123", isAdmin: false };

    mockReq.headers.authorization = `Bearer ${token}`;
    jwt.verify.mockReturnValue(decodedToken);
    User.findById.mockResolvedValue({
      _id: "user123",
      email: "john@example.com",
      name: "John Doe",
    });

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
    expect(User.findById).toHaveBeenCalledWith("user123");
    expect(mockNext).toHaveBeenCalled();
  });

  test("should return 401 if no token provided", async () => {
    mockReq.headers.authorization = undefined;

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  test("should return 401 if token format is invalid", async () => {
    mockReq.headers.authorization = "InvalidFormat token";

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  test("should return 401 if token verification fails", async () => {
    const token = "invalid-token";
    mockReq.headers.authorization = `Bearer ${token}`;
    jwt.verify.mockThrowValue(new Error("Invalid token"));

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  test("should return 404 if user not found after token verification", async () => {
    const token = "valid-token";
    const decodedToken = { id: "nonexistent-user", isAdmin: false };

    mockReq.headers.authorization = `Bearer ${token}`;
    jwt.verify.mockReturnValue(decodedToken);
    User.findById.mockResolvedValue(null);

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockNext).not.toHaveBeenCalled();
  });

  test("should attach user data to request object", async () => {
    const token = "valid-token";
    const decodedToken = { id: "user123" };
    const userData = {
      _id: "user123",
      email: "john@example.com",
      name: "John Doe",
      isAdmin: false,
    };

    mockReq.headers.authorization = `Bearer ${token}`;
    jwt.verify.mockReturnValue(decodedToken);
    User.findById.mockResolvedValue(userData);

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockReq.user).toEqual(userData);
    expect(mockNext).toHaveBeenCalled();
  });
});
