import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import express from "express";
import authRoutes from "../src/routes/auth.routes.js";
import categoryRoutes from "../src/routes/category.routes.js";
import cartRoutes from "../src/routes/cart.routes.js";
import productRoutes from "../src/routes/product.routes.js";
import productVariantRoutes from "../src/routes/productVariant.routes.js";
import User from "../src/models/User.js";
import Product from "../src/models/Product.js";
import ProductVariant from "../src/models/ProductVariant.js";
import Cart from "../src/models/Cart.js";
import Category from "../src/models/Category.js";
import errorHandler from "../src/middlewares/errorHandler.js";
import multer from "multer";

let mongoServer;
let app;
let customerToken;
let vendorToken;
let adminToken;
let variantId;

const upload = multer({ storage: multer.memoryStorage() });

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/product", productRoutes);
  app.use("/api/product-variant", upload.array("images", 5), productVariantRoutes);
  app.use("/api/cart", cartRoutes);
  app.use(errorHandler);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Cart.deleteMany({});
  await ProductVariant.deleteMany({});
  await Product.deleteMany({});
  await Category.deleteMany({});
  await User.deleteMany({});
});

const registerUser = async (name, email, phone) => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({
      name,
      email,
      phone,
      password: "Password@1234",
    });

  expect(res.status).toBe(201);
  return res.body.data;
};

const makeRole = async (userId, role) => {
  const user = await User.findById(userId);
  user.role = [role];
  await user.save();
};

const makeAdmin = async (userId) => makeRole(userId, "ADMIN");
const makeVendor = async (userId) => makeRole(userId, "VENDOR");

const createCategory = async (token) => {
  const res = await request(app)
    .post("/api/categories")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Cart Category", status: "ACTIVE" });

  expect(res.status).toBe(201);
  return res.body.data._id;
};

const createProductAndVariant = async (productToken, productVendorId, categoryId) => {
  const productRes = await request(app)
    .post("/api/product")
    .set("Authorization", `Bearer ${productToken}`)
    .send({
      name: "Cart Test Product",
      categoryId,
      description: "For cart testing",
      status: "ACTIVE",
    });
  expect(productRes.status).toBe(201);
  const productId = productRes.body.data._id;

  const variantRes = await request(app)
    .post(`/api/product-variant/${productId}`)
    .set("Authorization", `Bearer ${productToken}`)
    .field("brand", "TestBrand")
    .field("price", "100")
    .field("stock", "10");
  expect(variantRes.status).toBe(201);
  return variantRes.body.data;
};

beforeEach(async () => {
  const customer = await registerUser("Cart Customer", "cartcust@example.com", "9861000001");
  customerToken = customer.accessToken;

  const vendor = await registerUser("Cart Vendor", "cartvendor@example.com", "9861000002");
  vendorToken = vendor.accessToken;
  await makeVendor(vendor.user.id);

  const admin = await registerUser("Cart Admin", "cartadmin@example.com", "9861000003");
  adminToken = admin.accessToken;
  await makeAdmin(admin.user.id);

  const categoryId = await createCategory(adminToken);
  const variant = await createProductAndVariant(vendorToken, vendor.user.id, categoryId);
  variantId = variant._id;
});

describe("Cart Module", () => {
  describe("GET /api/cart", () => {
    it("should return empty cart for a user with no items", async () => {
      const res = await request(app)
        .get("/api/cart")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it("should return 401 without a token", async () => {
      const res = await request(app).get("/api/cart");

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/cart", () => {
    it("should add an item to the cart", async () => {
      const res = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ productVariantId: variantId, quantity: 2 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.productVariant._id).toBe(variantId);
      expect(res.body.data.quantity).toBe(2);
    });

    it("should default quantity to 1 when not provided", async () => {
      const res = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ productVariantId: variantId });

      expect(res.status).toBe(201);
      expect(res.body.data.quantity).toBe(1);
    });

    it("should merge quantities when adding the same variant twice", async () => {
      await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ productVariantId: variantId, quantity: 2 });

      const res = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ productVariantId: variantId, quantity: 3 });

      expect(res.status).toBe(201);
      expect(res.body.data.quantity).toBe(5);
    });

    it("should return 404 for a non-existent variant", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ productVariantId: fakeId, quantity: 1 });

      expect(res.status).toBe(404);
    });

    it("should return 400 when quantity exceeds stock", async () => {
      const res = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ productVariantId: variantId, quantity: 999 });

      expect(res.status).toBe(400);
    });

    it("should return 400 for invalid variant id format", async () => {
      const res = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ productVariantId: "notanid", quantity: 1 });

      expect(res.status).toBe(400);
    });

    it("should return 401 without a token", async () => {
      const res = await request(app)
        .post("/api/cart")
        .send({ productVariantId: variantId, quantity: 1 });

      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/cart/:cartId", () => {
    it("should update the quantity of a cart item", async () => {
      const addRes = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ productVariantId: variantId, quantity: 2 });
      const cartId = addRes.body.data._id;

      const res = await request(app)
        .put(`/api/cart/${cartId}`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.quantity).toBe(5);
    });

    it("should return 404 when updating another user's cart item", async () => {
      const addRes = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ productVariantId: variantId, quantity: 2 });
      const cartId = addRes.body.data._id;

      const otherUser = await registerUser("Other Customer", "othercust@example.com", "9861000009");
      const res = await request(app)
        .put(`/api/cart/${cartId}`)
        .set("Authorization", `Bearer ${otherUser.accessToken}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(404);
    });

    it("should return 400 when quantity exceeds stock", async () => {
      const addRes = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ productVariantId: variantId, quantity: 1 });
      const cartId = addRes.body.data._id;

      const res = await request(app)
        .put(`/api/cart/${cartId}`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ quantity: 999 });

      expect(res.status).toBe(400);
    });

    it("should return 400 for invalid quantity", async () => {
      const addRes = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ productVariantId: variantId, quantity: 1 });
      const cartId = addRes.body.data._id;

      const res = await request(app)
        .put(`/api/cart/${cartId}`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ quantity: 0 });

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/cart/:cartId", () => {
    it("should remove an item from the cart", async () => {
      const addRes = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ productVariantId: variantId, quantity: 2 });
      const cartId = addRes.body.data._id;

      const res = await request(app)
        .delete(`/api/cart/${cartId}`)
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const cart = await Cart.find({ user: (await User.findOne({ email: "cartcust@example.com" }))._id });
      expect(cart).toEqual([]);
    });

    it("should return 404 when removing a non-existent cart item", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .delete(`/api/cart/${fakeId}`)
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/cart", () => {
    it("should clear all items in the cart", async () => {
      await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ productVariantId: variantId, quantity: 2 });

      const res = await request(app)
        .delete("/api/cart")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const cart = await Cart.find({ user: (await User.findOne({ email: "cartcust@example.com" }))._id });
      expect(cart).toEqual([]);
    });
  });
});
