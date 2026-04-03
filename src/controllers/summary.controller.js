const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const summaryService = require('../services/summary.service');

const getDashboard = catchAsync(async (_req, res) => {
  const summary = await summaryService.getDashboardSummary();
  ApiResponse.ok(summary, 'Dashboard summary retrieved successfully').send(res);
});

module.exports = { getDashboard };
