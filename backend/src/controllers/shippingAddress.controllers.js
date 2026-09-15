import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import shippingAddressServices from "../services/shippingAddress.services.js";

const addAddress = asyncHandler(async (req, res) => {
    const address = await shippingAddressServices.addAddress(req.body, req.user._id);
    res.status(201).json(new ApiResponse(201, "Address added successfully.", address));
});

const getMyAddresses = asyncHandler(async (req, res) => {
    const addresses = await shippingAddressServices.getMyAddresses(req.user._id);
    res.status(200).json(new ApiResponse(200, "Addresses fetched successfully.", addresses));
});

const getAddressById = asyncHandler(async (req, res) => {
    const address = await shippingAddressServices.getAddressById(req.params.id, req.user._id);
    res.status(200).json(new ApiResponse(200, "Address fetched successfully.", address));
});

const updateAddress = asyncHandler(async (req, res) => {
    const address = await shippingAddressServices.updateAddress(req.params.id, req.body, req.user._id);
    res.status(200).json(new ApiResponse(200, "Address updated successfully.", address));
});

const deleteAddress = asyncHandler(async (req, res) => {
    const result = await shippingAddressServices.deleteAddress(req.params.id, req.user._id);
    res.status(200).json(new ApiResponse(200, result.message, null));
});

export default { addAddress, getMyAddresses, getAddressById, updateAddress, deleteAddress };
