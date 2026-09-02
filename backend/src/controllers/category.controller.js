import categoryService from "../services/category.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);

  return res.status(201).json(new ApiResponse(201, "Category created successfully", category));
});

const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAllCategories();

  return res.status(200).json(new ApiResponse(200, "Categories retrieved successfully", categories));
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);

  return res.status(200).json(new ApiResponse(200, "Category retrieved successfully", category));
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(
    req.params.id,
    req.body
  );

  return res.status(200).json(new ApiResponse(200, "Category updated successfully", category));
});

const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);

  return res.status(200).json(new ApiResponse(200, "Category deleted successfully", null));
});

export default {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
