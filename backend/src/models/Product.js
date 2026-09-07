import mongoose from "mongoose";

const productModel = mongoose.Schema({
  vendorId:{
    type:mongoose.Schema.ObjectId,
    ref:"User",
    required:true,
  },
  categoryId:{
    type:mongoose.Schema.ObjectId,
    ref:"Category",
    required:true,
  },
  name:{
    type:String,
    minlength:[3, "Product name must be at least 3 characters"],
    maxlength:[100, "Product name cannot exceed 100 characters"],
    required:[true,"Product name is required."]
  },
  description:String,
  isFeatured:{
    type:Boolean,
    default:false
  },
  status:{
    type: String,
    enum: ["ACTIVE", "INACTIVE"],
    default: "ACTIVE",
  },
},
{ timestamps : true}
)

export default mongoose.model("Product",productModel);
