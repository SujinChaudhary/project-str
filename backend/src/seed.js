import mongoose from "mongoose";
import databaseConnection from "./config/db.js";
import User from "./models/User.js";
import Product from "./models/Product.js";
import ShippingAddress from "./models/ShippingAddress.js";
import { generateAccessToken } from "./utils/jwt.js";

const run = async () => {
    await databaseConnection();

    await User.deleteMany({ email: { $in: ["customer@test.com", "admin@test.com"] } });

    const customer = await User.create({
        name: "Test Customer",
        email: "customer@test.com",
        password: "Password123!",
        phone: "9800000000",
        role: ["CUSTOMER"],
        registrationAddress: {
            streetAddress: "Thamel, Ward 26",
            city: "Kathmandu",
            state: "Bagmati",
            postalCode: "44600",
        },
    });

    const admin = await User.create({
        name: "Test Admin",
        email: "admin@test.com",
        password: "Password123!",
        role: ["ADMIN"],
    });

    const product = await Product.create({
        name: "Test Product",
        brand: "TestBrand",
        category: "misc",
        price: 500,
    });

    // Default shipping address for the test customer
    const shippingAddress = await ShippingAddress.create({
        user: customer._id,
        fullName: "Test Customer",
        phoneNumber: "9800000000",
        streetAddress: "Thamel, Ward 26",
        city: "Kathmandu",
        state: "Bagmati",
        postalCode: "44600",
        isDefault: true,
    });

    const customerToken = generateAccessToken(customer);
    const adminToken = generateAccessToken(admin);

    console.log("\n=== SEED DATA ===");
    console.log("CUSTOMER ID      :", customer._id.toString());
    console.log("ADMIN ID         :", admin._id.toString());
    console.log("PRODUCT ID       :", product._id.toString());
    console.log("SHIPPING ID      :", shippingAddress._id.toString());
    console.log("CUSTOMER TOKEN   :", customerToken);
    console.log("ADMIN TOKEN      :", adminToken);

    console.log("\n--- CUSTOMER TOKEN ---");
    console.log(customerToken);
    console.log("--- ADMIN TOKEN ---");
    console.log(adminToken);
    console.log("-------------------\n");

    process.exit(0);
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
