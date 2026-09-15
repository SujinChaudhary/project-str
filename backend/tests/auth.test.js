import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import express from "express";
import authRoutes from "../src/routes/auth.routes.js";
import adminRoutes from "../src/routes/admin.routes.js";
import userRoutes from "../src/routes/user.routes.js";
import User from "../src/models/User.js";
import errorHandler from "../src/middlewares/errorHandler.js";

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/user", userRoutes);
  app.use(errorHandler);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe("Authentication", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "John Doe",
          email: "john@example.com",
          phone: "9861000001",
          password: "Password@1234",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.name).toBe("John Doe");
      expect(res.body.data.user.email).toBe("john@example.com");
      expect(res.body.data.user.role).toEqual(["CUSTOMER"]);
      expect(res.body.data.user.id).toBeDefined();
    });

    it("should not register with duplicate email", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "John Doe",
          email: "john@example.com",
          phone: "9861000001",
          password: "Password@1234",
        });

      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "John Doe 2",
          email: "john@example.com",
          phone: "9861000001",
          password: "Password@1234",
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it("should not register with invalid input", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "J",
          email: "invalid-email",
          phone: "9861000900",
          password: "123",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should hash the password", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "John Doe",
          email: "john@example.com",
          phone: "9861000001",
          password: "Password@1234",
        });

      const user = await User.findOne({ email: "john@example.com" }).select("+password");
      expect(user.password).not.toBe("Password@1234");
    });

    it("should assign default customer role", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "John Doe",
          email: "john@example.com",
          phone: "9861000001",
          password: "Password@1234",
        });

      expect(res.body.data.user.role).toEqual(["CUSTOMER"]);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "John Doe",
          email: "john@example.com",
          phone: "9861000001",
          password: "Password@1234",
        });
    });

    it("should login successfully", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "john@example.com",
          password: "Password@1234",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.email).toBe("john@example.com");
    });

    it("should not login with wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "john@example.com",
          password: "Wrongpass@123",
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should not login with non-existent user", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "Password@1234",
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should generate a valid JWT", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "john@example.com",
          password: "Password@1234",
        });

      const token = res.body.data.accessToken;
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });
  });
});

describe("Refresh Token", () => {
  let refreshToken;

  beforeEach(async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "John Doe",
        email: "john@example.com",
          phone: "9861000001",
        password: "Password@1234",
      });
    refreshToken = res.body.data.refreshToken;
  });

  it("should refresh access token with valid refresh token", async () => {
    const res = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it("should reject invalid refresh token", async () => {
    const res = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken: "invalidtoken" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should reject missing refresh token", async () => {
    const res = await request(app)
      .post("/api/auth/refresh-token")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("Authentication Middleware", () => {
  let token;

  beforeEach(async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "John Doe",
        email: "john@example.com",
          phone: "9861000001",
        password: "Password@1234",
      });
    token = res.body.data.accessToken;
  });

  it("should access protected route with valid token", async () => {
    const res = await request(app)
      .get("/api/user/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe("john@example.com");
  });

  it("should reject request without token", async () => {
    const res = await request(app).get("/api/user/me");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should reject request with invalid token", async () => {
    const res = await request(app)
      .get("/api/user/me")
      .set("Authorization", "Bearer invalidtoken");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should reject request with malformed token", async () => {
    const res = await request(app)
      .get("/api/user/me")
      .set("Authorization", "InvalidFormat");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should reject request for deleted user", async () => {
    await User.deleteMany({});

    const res = await request(app)
      .get("/api/user/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe("Role-Based Authorization", () => {
  let adminToken;
  let customerToken;
  let vendorToken;

  beforeEach(async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Admin User",
        email: "admin@example.com",
          phone: "9861000002",
        password: "Password@1234",
      });

    const admin = await User.findOne({ email: "admin@example.com" });
    admin.role = ["ADMIN"];
    await admin.save();

    const adminRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@example.com",
        password: "Password@1234",
      });
    adminToken = adminRes.body.data.accessToken;

    const customerRes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Customer User",
        email: "customer@example.com",
          phone: "9861000003",
        password: "Password@1234",
      });
    customerToken = customerRes.body.data.accessToken;

    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Vendor User",
        email: "vendor@example.com",
          phone: "9861000004",
        password: "Password@1234",
      });

    const vendor = await User.findOne({ email: "vendor@example.com" });
    vendor.role = ["VENDOR"];
    await vendor.save();

    const vendorRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "vendor@example.com",
        password: "Password@1234",
      });
    vendorToken = vendorRes.body.data.accessToken;
  });

  it("should allow admin to access admin route", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should deny customer access to admin route", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("should deny vendor access to admin route", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${vendorToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("should deny unauthenticated access to admin route", async () => {
    const res = await request(app).get("/api/admin/users");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should allow user with multiple roles to access both", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Multi User",
        email: "multi@example.com",
          phone: "9861000005",
        password: "Password@1234",
      });

    const multi = await User.findOne({ email: "multi@example.com" });
    multi.role = ["CUSTOMER", "VENDOR"];
    await multi.save();

    const multiRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "multi@example.com",
        password: "Password@1234",
      });
    const multiToken = multiRes.body.data.accessToken;

    const vendorRes = await request(app)
      .get("/api/user/me")
      .set("Authorization", `Bearer ${multiToken}`);
    expect(vendorRes.status).toBe(200);

    const adminRes = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${multiToken}`);
    expect(adminRes.status).toBe(403);
  });
});
