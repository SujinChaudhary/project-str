import axiosInstance from "../axiosInstance";

export const getProducts = (params) =>
  axiosInstance.get("/product", { params }); // params: { category, search, page, limit }

export const getProductById = (id) =>
  axiosInstance.get(`/products/${id}`);