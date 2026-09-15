import request from "supertest";
import app from "../src/server.js";

import User from "../src/models/User.js";
import Product from "../src/models/Product.js";
import Category from "../src/models/Category.js";
import ShippingAddress from "../src/models/ShippingAddress.js";
import Order from "../src/models/Order.js";
import Review from "../src/models/Review.js";

import { generateAccessToken } from "../src/utils/jwt.js";
import { ORDER_STATUS_DELIVERED } from "../src/constants/orderStatuses.js";

describe("Review Module", () => {
  let authToken;
  let userId;
  let productId;
  let orderId;

  const getReviewData = (res) => {
    return res.body.message;
  };

  beforeEach(async () => {
    const user = await User.create({
      name: "Test User",
      email: "testuser@example.com",
      password: "Password123!",
      phone: "9800000001",
      role: ["CUSTOMER"],
    });

    userId = user._id;
    authToken = generateAccessToken(user);

    const vendor = await User.create({
      name: "Test Vendor",
      email: "testvendor@example.com",
      password: "Password123!",
      phone: "9800000003",
      role: ["VENDOR"],
    });

    const admin = await User.create({
      name: "Test Admin",
      email: "testadmin@example.com",
      password: "Password123!",
      phone: "9800000004",
      role: ["ADMIN"],
    });

    const category = await Category.create({
      name: "Test Category",
      managedBy: admin._id,
    });

    const product = await Product.create({
      name: "Test Product",
      price: 1000,
      categoryId: category._id,
      vendorId: vendor._id,
    });

    productId = product._id;

    const shippingAddress = await ShippingAddress.create({
      user: user._id,
      fullName: "Test User",
      phone: "9800000001",
      streetAddress: "123 Test Street",
      city: "Kathmandu",
      country: "Nepal",
    });

    const order = await Order.create({
      user: user._id,
      orderItems: [
        {
          product: product._id,
          quantity: 1,
          price_at_purchase: 1000,
        },
      ],
      status: ORDER_STATUS_DELIVERED,
      orderNumber: `TEST-${Date.now()}`,
      totalPrice: 1000,
      shippingAddress: shippingAddress._id,
    });

    orderId = order._id;
  });

  afterEach(async () => {
    await Review.deleteMany({});
    await Order.deleteMany({});
    await ShippingAddress.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
  });

  it("should allow a review when the order is delivered and contains the product", async () => {
    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        product: productId,
        order: orderId,
        rating: 5,
        comment: "Great!",
      });

    expect(res.status).toBe(201);

    const reviewData = getReviewData(res);

    expect(reviewData).toBeDefined();
    expect(reviewData.rating).toBe(5);
    expect(reviewData.product.toString()).toBe(productId.toString());
    expect(reviewData.order.toString()).toBe(orderId.toString());
  });

  it("should reject a review if no matching delivered order exists", async () => {
    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        product: productId,
        order: "000000000000000000000000",
        rating: 5,
      });

    expect(res.status).toBe(403);
  });

  it("should reject a duplicate review for the same product", async () => {
    const firstReview = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        product: productId,
        order: orderId,
        rating: 4,
      });

    expect(firstReview.status).toBe(201);

    const secondReview = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        product: productId,
        order: orderId,
        rating: 3,
      });

    expect(secondReview.status).toBe(409);
  });

  it("should allow the review owner to delete their own review", async () => {
    const created = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        product: productId,
        order: orderId,
        rating: 4,
      });

    expect(created.status).toBe(201);

    const reviewData = getReviewData(created);
    expect(reviewData).toBeDefined();

    const reviewId = reviewData._id;

    expect(reviewId).toBeDefined();

    const res = await request(app)
      .delete(`/api/reviews/${reviewId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);

    const deletedReview = await Review.findById(reviewId);

    expect(deletedReview).toBeNull();
  });

  it("should reject deletion by a user who does not own the review and is not an admin", async () => {
    const created = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        product: productId,
        order: orderId,
        rating: 4,
      });

    expect(created.status).toBe(201);

    const reviewData = getReviewData(created);
    expect(reviewData).toBeDefined();

    const reviewId = reviewData._id;

    expect(reviewId).toBeDefined();

    const otherUser = await User.create({
      name: "Other User",
      email: "otheruser@example.com",
      password: "Password123!",
      phone: "9800000002",
      role: ["CUSTOMER"],
    });

    const otherToken = generateAccessToken(otherUser);

    const res = await request(app)
      .delete(`/api/reviews/${reviewId}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.status).toBe(403);

    const review = await Review.findById(reviewId);

    expect(review).not.toBeNull();
  });
});
