import ShippingAddress from "../models/ShippingAddress.js";
import { AppError } from "../utils/AppError.js";

const addAddress = async (data, userId) => {
    const address = await ShippingAddress.create({ ...data, user: userId });
    return address;
};

const getMyAddresses = async (userId) => {
    return await ShippingAddress.find({ user: userId }).sort({ createdAt: -1 });
};

const getAddressById = async (id, userId) => {
    const address = await ShippingAddress.findOne({ _id: id, user: userId });

    if (!address) {
        throw new AppError("Address not found!", 404);
    }

    return address;
};

const updateAddress = async (id, data, userId) => {
    const address = await ShippingAddress.findOneAndUpdate(
        { _id: id, user: userId },
        data,
        { new: true }
    );

    if (!address) {
        throw new AppError("Address not found!", 404);
    }

    return address;
};

const deleteAddress = async (id, userId) => {
    const address = await ShippingAddress.findOneAndDelete({ _id: id, user: userId });

    if (!address) {
        throw new AppError("Address not found!", 404);
    }

    return { message: "Address deleted successfully." };
};

export default { addAddress, getMyAddresses, getAddressById, updateAddress, deleteAddress };
