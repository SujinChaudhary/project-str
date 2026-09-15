import vendorStatisticsServices from "../services/vendorStatistics.services.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getStatistics = asyncHandler(async (req, res) => {
  const data = await vendorStatisticsServices.getVendorStatistics(
    req.user._id,
    req.query
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Vendor statistics fetched successfully.", data));
});

export default { getStatistics };
