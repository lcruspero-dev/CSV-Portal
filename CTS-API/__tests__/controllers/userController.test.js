const asyncHandler = require("express-async-handler");
const userController = require("../../controllers/userController");
const User = require("../../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

jest.mock("../../models/userModel");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("User Controller", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
      user: {},
      params: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  describe("registerUser", () => {
    test("should register a new user successfully", async () => {
      mockReq.body = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      const hashedPassword = "hashedpassword123";
      const newUser = {
        _id: "user123",
        name: "John Doe",
        email: "john@example.com",
        password: hashedPassword,
        isAdmin: false,
        role: "user",
      };

      bcrypt.genSalt.mockResolvedValue("salt");
      bcrypt.hash.mockResolvedValue(hashedPassword);
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(newUser);
      jwt.sign.mockReturnValue("token123");

      await userController.registerUser(mockReq, mockRes);

      expect(User.findOne).toHaveBeenCalledWith({ email: "john@example.com" });
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", "salt");
      expect(User.create).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: "user123",
          name: "John Doe",
          email: "john@example.com",
          token: "token123",
        }),
      );
    });

    test("should return 400 if required fields are missing", async () => {
      mockReq.body = {
        name: "John Doe",
        email: "john@example.com",
        // missing password
      };

      try {
        await userController.registerUser(mockReq, mockRes);
      } catch (error) {
        expect(error.message).toBe("Please provide all required fields");
      }
    });

    test("should return 400 if user already exists", async () => {
      mockReq.body = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      const existingUser = { _id: "user123", email: "john@example.com" };
      User.findOne.mockResolvedValue(existingUser);

      try {
        await userController.registerUser(mockReq, mockRes);
      } catch (error) {
        expect(error.message).toBe("User already exists");
      }
    });

    test("should set isAdmin to false if not provided", async () => {
      mockReq.body = {
        name: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
        // isAdmin not provided
      };

      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue("salt");
      bcrypt.hash.mockResolvedValue("hashedpassword");
      User.create.mockResolvedValue({
        _id: "user456",
        name: "Jane Doe",
        email: "jane@example.com",
        isAdmin: false,
        role: "user",
      });
      jwt.sign.mockReturnValue("token456");

      await userController.registerUser(mockReq, mockRes);

      const createCall = User.create.mock.calls[0][0];
      expect(createCall.isAdmin).toBe(false);
    });
  });

  describe("loginUser", () => {
    test("should login user with valid credentials", async () => {
      mockReq.body = {
        email: "john@example.com",
        password: "password123",
      };

      const mockUser = {
        _id: "user123",
        name: "John Doe",
        email: "john@example.com",
        isAdmin: false,
        role: "user",
        status: "active",
        loginLimit: 1,
        password: "hashedpassword123",
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("token123");

      await userController.loginUser(mockReq, mockRes);

      expect(User.findOne).toHaveBeenCalledWith({ email: "john@example.com" });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashedpassword123",
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: "user123",
          email: "john@example.com",
          token: "token123",
        }),
      );
    });

    test("should return 401 for invalid password", async () => {
      mockReq.body = {
        email: "john@example.com",
        password: "wrongpassword",
      };

      const mockUser = {
        _id: "user123",
        email: "john@example.com",
        password: "hashedpassword123",
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      try {
        await userController.loginUser(mockReq, mockRes);
      } catch (error) {
        expect(error.message).toBe("Invalid credentials");
      }
    });

    test("should return 401 if user not found", async () => {
      mockReq.body = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      User.findOne.mockResolvedValue(null);

      try {
        await userController.loginUser(mockReq, mockRes);
      } catch (error) {
        expect(error.message).toBe("Invalid credentials");
      }
    });
  });

  describe("getMe", () => {
    test("should return current user data", async () => {
      mockReq.user = {
        _id: "user123",
        email: "john@example.com",
        name: "John Doe",
        isAdmin: false,
      };

      await userController.getMe(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        id: "user123",
        email: "john@example.com",
        name: "John Doe",
        isAdmin: false,
      });
    });
  });
});
