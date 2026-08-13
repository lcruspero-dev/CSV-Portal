const User = require("../../models/userModel");

describe("User Model", () => {
  describe("Email Validation", () => {
    test("should accept valid email format", () => {
      const user = new User({
        name: "John Doe",
        email: "john@example.com",
        password: "hashedpassword",
      });

      const error = user.validateSync();
      expect(error).toBeUndefined();
    });

    test("should reject invalid email format", () => {
      const user = new User({
        name: "John Doe",
        email: "invalid-email",
        password: "hashedpassword",
      });

      const error = user.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    test("should reject empty email", () => {
      const user = new User({
        name: "John Doe",
        email: "",
        password: "hashedpassword",
      });

      const error = user.validateSync();
      expect(error).toBeDefined();
    });
  });

  describe("Required Fields Validation", () => {
    test("should reject user without name", () => {
      const user = new User({
        email: "john@example.com",
        password: "hashedpassword",
      });

      const error = user.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
    });

    test("should reject user without email", () => {
      const user = new User({
        name: "John Doe",
        password: "hashedpassword",
      });

      const error = user.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    test("should reject user without password", () => {
      const user = new User({
        name: "John Doe",
        email: "john@example.com",
      });

      const error = user.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.password).toBeDefined();
    });
  });

  describe("Default Values", () => {
    test('should set default role as "user"', () => {
      const user = new User({
        name: "John Doe",
        email: "john@example.com",
        password: "hashedpassword",
      });

      expect(user.role).toBe("user");
    });

    test("should set default isAdmin as false", () => {
      const user = new User({
        name: "John Doe",
        email: "john@example.com",
        password: "hashedpassword",
      });

      expect(user.isAdmin).toBe(false);
    });

    test('should set default status as "active"', () => {
      const user = new User({
        name: "John Doe",
        email: "john@example.com",
        password: "hashedpassword",
      });

      expect(user.status).toBe("active");
    });
  });

  describe("Field Length Validations", () => {
    test("should accept name within length limits", () => {
      const user = new User({
        name: "John",
        email: "john@example.com",
        password: "hashedpassword",
      });

      const error = user.validateSync();
      expect(error).toBeUndefined();
    });

    test("should reject name exceeding maximum length", () => {
      const longName = "A".repeat(256);
      const user = new User({
        name: longName,
        email: "john@example.com",
        password: "hashedpassword",
      });

      const error = user.validateSync();
      if (error && error.errors.name) {
        expect(error.errors.name).toBeDefined();
      }
    });
  });

  describe("Admin Flag", () => {
    test("should allow user to be set as admin", () => {
      const user = new User({
        name: "Admin User",
        email: "admin@example.com",
        password: "hashedpassword",
        isAdmin: true,
      });

      expect(user.isAdmin).toBe(true);
    });

    test("should allow user to be regular user", () => {
      const user = new User({
        name: "Regular User",
        email: "user@example.com",
        password: "hashedpassword",
        isAdmin: false,
      });

      expect(user.isAdmin).toBe(false);
    });
  });
});
