import adminStatisticsServices from "../services/adminStatistics.services.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getStatistics = asyncHandler(async (req, res) => {
    const data = await adminStatisticsServices.getAdminStatistics(req.query);

    res.status(200).json(new ApiResponse(200, "Admin statistics fetched successfully.", data));
});

export default { getStatistics };
