import categoryService from "../services/category.service.js";
import asyncHandler from "../utils/asyncHandler.js";

const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);

  return res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAllCategories();

  return res.status(200).json({
    success: true,
    message: "Categories retrieved successfully",
    data: categories,
  });
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);

  return res.status(200).json({
    success: true,
    message: "Category retrieved successfully",
    data: category,
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(
    req.params.id,
    req.body
  );

  return res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);

  return res.status(200).json({
    success: true,
    message: "Category deleted successfully",
    data: null,
  });
});

export default {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
