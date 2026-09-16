import axiosInstance from "../axiosInstance";

export const createOrder = (payload) =>
  axiosInstance.post("/orders", payload); // payload: { items, shippingAddressId }

export const getOrders = () =>
  axiosInstance.get("/orders");

export const getOrderById = (id) =>
  axiosInstance.get(`/orders/${id}`);
