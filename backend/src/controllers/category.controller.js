import Category from "../models/Category.js";
import { AppError } from "../utils/AppError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, isActive } = req.body;

  if (!name || name.trim() === "") {
    throw new AppError("Category name is required", 400);
  }

  const existingCategory = await Category.findOne({ name: name.trim() });
  if (existingCategory) {
    throw new AppError("Category with this name already exists", 409);
  }

  const category = await Category.create({
    name: name.trim(),
    description: description?.trim() || "",
    isActive: isActive !== undefined ? isActive : true,
  });

  res.status(201).json(new ApiResponse(201, "Category created successfully", category));
});

export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, "Categories retrieved successfully", categories));
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  res.status(200).json(new ApiResponse(200, "Category retrieved successfully", category));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, isActive } = req.body;

  const category = await Category.findById(id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  if (name !== undefined) {
    if (name.trim() === "") {
      throw new AppError("Category name cannot be empty", 400);
    }
    const duplicate = await Category.findOne({ name: name.trim(), _id: { $ne: id } });
    if (duplicate) {
      throw new AppError("Category with this name already exists", 409);
    }
    category.name = name.trim();
  }

  if (description !== undefined) {
    category.description = description.trim();
  }

  if (isActive !== undefined) {
    category.isActive = isActive;
  }

  const updatedCategory = await category.save();

  res.status(200).json(new ApiResponse(200, "Category updated successfully", updatedCategory));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  await Category.findByIdAndDelete(id);

  res.status(200).json(new ApiResponse(200, "Category deleted successfully", null));
});
