import productVariantServices from "../services/productVariant.services.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createVariant = asyncHandler(async(req,res)=>{
  console.log(req.body,req.files,req.params.id)
  const data = await productVariantServices.createVariant(req.body,req.files,req.params.id);

  res.status(201).json(new ApiResponse(201,"Product variant created successfully!",data));
});

const getVariantsByProduct = asyncHandler(async(req,res)=>{
  const data = await productVariantServices.getVariantsByProduct(req.params.id);

  res.status(200).json(new ApiResponse(200,"Product variant fetched successfully",data));
});

const updateVariant = asyncHandler(async(req,res)=>{
  const data = await productVariantServices.updateVariant(req.body,req.files,req.params.id,);

  res.status(200).json(new ApiResponse(200,"Variant updated successfully.",data));
});

const deleteVariant = asyncHandler(async(req,res)=>{
  const data = await productVariantServices.deleteVariant(req.params.id);

  res.status(200).json(new ApiResponse(200,"Product variant deleted successfully!",data));
});

export default {createVariant,getVariantsByProduct,updateVariant,deleteVariant};