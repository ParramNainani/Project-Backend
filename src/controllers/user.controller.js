const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const userService = require('../services/user.service');

const listUsers = catchAsync(async (req, res) => {
  const result = await userService.listUsers(req.query);
  ApiResponse.ok(result, 'Users retrieved successfully').send(res);
});

const updateRole = catchAsync(async (req, res) => {
  const user = await userService.updateRole(req.params.id, req.body.role, req.user);
  ApiResponse.ok(user, 'User role updated successfully').send(res);
});

const updateStatus = catchAsync(async (req, res) => {
  const user = await userService.updateStatus(req.params.id, req.body.status, req.user);
  ApiResponse.ok(user, 'User status updated successfully').send(res);
});

module.exports = { listUsers, updateRole, updateStatus };
