import formatProductPrompt from '../helpers/productPrompt.js'
import promptAi from '../utils/prompt.js'
import Product from '../models/Product.js';
import { AppError } from '../utils/AppError.js';

const createProduct =async(data,vendorId)=>{
  let description = data.description;

  if(!data.description){
    try {
      const descriptionPrompt = formatProductPrompt(data);
      description = await promptAi(descriptionPrompt);
    } catch (error) {
      console.log("AI FAILED:",error.message);
      description = " " // later description update if ai failed 
    }
  }

  return await Product.create({...data,vendorId,description})
}
const updateProduct =async(productId,data,vendorId)=>{
  const product = await Product.findById(productId);

  if(!product){
    throw new AppError("Product not found!",404);
  }

  if( product.vendorId.toString() !== vendorId.toString()){
    throw new AppError("Unauthorized!",401);
  }

  return await Product.findByIdAndUpdate(productId,data,{new:true});
}
const deleteProduct =async(productId,vendorId)=>{
  const product = await Product.findById(productId);

  if(!product){
    throw new AppError("Product not found!",404);
  }

   if( product.vendorId.toString() !== vendorId.toString()){
    throw new AppError("Unauthorized!",401);
  }

  return await Product.deleteOne({_id:productId});
}

const getAllProducts =async(query)=>{
    // sorting
  const limit = query?.limit;
  const sort = query?.sort ? JSON.parse(query.sort) : null;
  const offset = query?.offset;

  // filtering
  const filters={};
  if(query?.name) filters.name = {$regex:query?.name, $options:"i"} //case insensitive
  
  const products = await Product.find(filters).limit(limit).sort(sort).skip(offset);

  if(!products){
    throw new AppError("Products not found!",404);
  }

  return products
}
const getProductById =async(id)=>{
  const product = await Product.findById(id);
  
  if(!product){
    throw new AppError("Product not found!",404);
  }

  return product;
}


const getProductsByVendor =async(vendorId)=>{
  const products = await Product.find({vendorId});
  
  if(products.length == 0){
    throw new AppError("Product not found!",404);
  }

  return products;
}

export default {createProduct,updateProduct,deleteProduct,getAllProducts,getProductById,getProductsByVendor};