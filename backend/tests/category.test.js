import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import express from "express";
import authRoutes from "../src/routes/authRoutes.js";
import categoryRoutes from "../src/routes/category.routes.js";
import User from "../src/models/User.js";
import Category from "../src/models/Category.js";
import errorHandler from "../src/middlewares/errorHandler.js";

let mongoServer;
let app;
let adminToken;
let customerToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use(errorHandler);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Category.deleteMany({});
  await User.deleteMany({});
});

const setupTokens = async () => {
  await request(app)
    .post("/api/auth/register")
    .send({
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
    });

  const admin = await User.findOne({ email: "admin@example.com" });
  admin.role = ["ADMIN"];
  await admin.save();

  const adminRes = await request(app)
    .post("/api/auth/login")
    .send({
      email: "admin@example.com",
      password: "password123",
    });
  adminToken = adminRes.body.data.accessToken;

  const customerRes = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Customer User",
      email: "customer@example.com",
      password: "password123",
    });
  customerToken = customerRes.body.data.accessToken;
};

describe("Category CRUD", () => {
  beforeEach(async () => {
    await setupTokens();
  });

  describe("POST /api/categories", () => {
    it("should create a new category successfully", async () => {
      const res = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Electronics",
          description: "Electronic gadgets and devices",
          status: "ACTIVE",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Category created successfully");
      expect(res.body.data.name).toBe("Electronics");
      expect(res.body.data.description).toBe("Electronic gadgets and devices");
      expect(res.body.data.status).toBe("ACTIVE");
      expect(res.body.data._id).toBeDefined();
      expect(res.body.data.createdAt).toBeDefined();
      expect(res.body.data.updatedAt).toBeDefined();
    });

    it("should create category with default values", async () => {
      const res = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Books",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.description).toBe("");
      expect(res.body.data.status).toBe("ACTIVE");
    });

    it("should not create category without name", async () => {
      const res = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          description: "Missing name field",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should not create category with empty name", async () => {
      const res = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "",
          description: "Empty name",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should not create category with duplicate name", async () => {
      await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Electronics",
          description: "First one",
        });

      const res = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Electronics",
          description: "Duplicate",
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it("should not create category with invalid status", async () => {
      const res = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Toys",
          status: "PENDING",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should not allow customer to create category", async () => {
      const res = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          name: "Toys",
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should not allow unauthenticated user to create category", async () => {
      const res = await request(app)
        .post("/api/categories")
        .send({
          name: "Toys",
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/categories", () => {
    it("should get all categories", async () => {
      await Category.create([
        { name: "Electronics", description: "Gadgets" },
        { name: "Books", description: "Reading material" },
      ]);

      const res = await request(app).get("/api/categories");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });

    it("should return empty array when no categories exist", async () => {
      const res = await request(app).get("/api/categories");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });
  });

  describe("GET /api/categories/:id", () => {
    it("should get a category by id", async () => {
      const category = await Category.create({
        name: "Electronics",
        description: "Gadgets",
      });

      const res = await request(app).get(`/api/categories/${category._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Electronics");
      expect(res.body.data._id).toBe(category._id.toString());
    });

    it("should return 404 for non-existent category", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/categories/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return error for invalid id format", async () => {
      const res = await request(app).get("/api/categories/invalid-id");

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PUT /api/categories/:id", () => {
    let categoryId;

    beforeEach(async () => {
      const category = await Category.create({
        name: "Electronics",
        description: "Gadgets",
        status: "ACTIVE",
      });
      categoryId = category._id;
    });

    it("should update a category successfully", async () => {
      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Electronics & Gadgets",
          description: "Updated description",
          status: "INACTIVE",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Electronics & Gadgets");
      expect(res.body.data.description).toBe("Updated description");
      expect(res.body.data.status).toBe("INACTIVE");
    });

    it("should partially update a category", async () => {
      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Name Only",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("Updated Name Only");
      expect(res.body.data.description).toBe("Gadgets");
      expect(res.body.data.status).toBe("ACTIVE");
    });

    it("should not update with duplicate name", async () => {
      await Category.create({ name: "Books" });

      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Books",
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it("should allow updating to the same name", async () => {
      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Electronics",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 404 for non-existent category", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/categories/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated",
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should not update with invalid status", async () => {
      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          status: "PENDING",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should not allow customer to update category", async () => {
      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          name: "Hacked",
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should not allow unauthenticated user to update category", async () => {
      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .send({
          name: "Hacked",
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("DELETE /api/categories/:id", () => {
    let categoryId;

    beforeEach(async () => {
      const category = await Category.create({
        name: "Electronics",
        description: "Gadgets",
      });
      categoryId = category._id;
    });

    it("should delete a category successfully", async () => {
      const res = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Category deleted successfully");
      expect(res.body.data).toBeNull();

      const deleted = await Category.findById(categoryId);
      expect(deleted).toBeNull();
    });

    it("should return 404 for non-existent category", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/categories/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return error for invalid id format", async () => {
      const res = await request(app)
        .delete("/api/categories/invalid-id")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });

    it("should not allow customer to delete category", async () => {
      const res = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should not allow unauthenticated user to delete category", async () => {
      const res = await request(app)
        .delete(`/api/categories/${categoryId}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
