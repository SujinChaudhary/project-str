import uploadFiles from '../utils/fileUploader.js';
import ProductVariant from '../models/ProductVariant.js';
import { AppError } from '../utils/AppError.js';

const createVariant = async(data,files,productId)=>{
  const uploadedFiles = await uploadFiles(files);

  return await ProductVariant.create({...data,imageUrls:uploadedFiles.map((item)=> item.url),productId})
}

const getVariantsByProduct = async (productId) => {
  const variants = await ProductVariant.find({ productId });

  if (variants.length === 0) {
    throw new AppError("No variants found for this product!", 404);
  }

  return variants;
};

const updateVariant = async (data, files, variantId) => {
  const variant = await ProductVariant.findById(variantId);

  if (!variant) {
    throw new AppError("Variant not found", 404);
  }

  let imageUrls = variant.imageUrls; 

  if (files && files.length > 0) {
    const uploadedFiles = await uploadFiles(files);
    imageUrls = uploadedFiles.map((item) => item.url);
  }

  const updatedVariant = await ProductVariant.findByIdAndUpdate(
    variantId,
    { ...data, imageUrls },
    { new: true }
  );

  return updatedVariant;
};

const deleteVariant = async (variantId) => {
  const variant = await ProductVariant.findById(variantId);

  if (!variant) {
    throw new AppError("Variant not found", 404);
  }

  await ProductVariant.findByIdAndDelete(variantId);

  return { message: "Variant deleted successfully" };
};

export default {createVariant,getVariantsByProduct,updateVariant,deleteVariant};