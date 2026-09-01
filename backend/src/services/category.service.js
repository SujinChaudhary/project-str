import Category from "../models/Category.js";
import { AppError } from "../utils/AppError.js";

const createCategory = async ({ name, description, status }) => {
  const existingCategory = await Category.findOne({ name });

  if (existingCategory) {
    throw new AppError("Category with this name already exists.", 409);
  }

  const category = await Category.create({ name, description, status });
  return category;
};

const getAllCategories = async () => {
  const categories = await Category.find();
  return categories;
};

const getCategoryById = async (id) => {
  const category = await Category.findById(id);

  if (!category) {
    throw new AppError("Category not found.", 404);
  }

  return category;
};

const updateCategory = async (id, updateData) => {
  if (updateData.name) {
    const existingCategory = await Category.findOne({
      name: updateData.name,
      _id: { $ne: id },
    });

    if (existingCategory) {
      throw new AppError("Category with this name already exists.", 409);
    }
  }

  const category = await Category.findByIdAndUpdate(id, updateData, {
    returnDocument: "after",
    runValidators: true,
  });

  if (!category) {
    throw new AppError("Category not found.", 404);
  }

  return category;
};

const deleteCategory = async (id) => {
  const category = await Category.findByIdAndDelete(id);

  if (!category) {
    throw new AppError("Category not found.", 404);
  }

  return category;
};

export default {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
