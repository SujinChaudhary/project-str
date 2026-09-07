import productServices from "../services/product.services.js"
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js"

const createProduct = asyncHandler(async(req,res)=>{
  const data = await productServices.createProduct(req.body,req.user._id);

  res.status(201).json(new ApiResponse(201,"Product created successfully.",data));
})
const updateProduct =asyncHandler(async(req,res)=>{
  console.log(req.body)
  const data = await productServices.updateProduct(req.params.id,req.body,req.user._id);

  res.status(200).json(new ApiResponse(200,"Product updated successfully",data));
})

const deleteProduct =asyncHandler(async(req,res)=>{
  const data = await productServices.deleteProduct(req.params.id,req.user._id);

  res.status(200).json(new ApiResponse(200,"Product deleted successfully",data));
})

const getAllProducts =asyncHandler(async(req,res)=>{
  const data = await productServices.getAllProducts(req.query);

  res.status(200).json(new ApiResponse(200,"All Product fetched successfully!",data));
})

const getProductById =asyncHandler(async(req,res)=>{
  const data = await productServices.getProductById(req.params.id);

  res.status(200).json(new ApiResponse(200,"Product fetched successfully",data));
})

const getProductsByVendor =asyncHandler(async(req,res)=>{
  const data = await productServices.getProductsByVendor(req.params.id);

  res.status(200).json(new ApiResponse(200,"Product fetched successfully",data));
})

export default {createProduct,updateProduct,deleteProduct,getAllProducts,getProductById,getProductsByVendor};