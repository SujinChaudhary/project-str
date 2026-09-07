import mongoose from "mongoose";

const productVariantModel = mongoose.Schema({
  productId:{
    type:mongoose.Schema.ObjectId,
    ref:"Product",
    required:true,
  },
  size:[String],
  color:[String],
  brand:{
    type:String,
    required:[true,"Product brand is required."]
  },
  price:{
    type:Number,
    required:[true,"Product price is required."],
    min:1,
    max:9999999
  },
  stock:{
    type: Number,
    default:1
  },
   imageUrls:[String]
},
{ timestamps : true}
)

export default mongoose.model("ProductVariant",productVariantModel);