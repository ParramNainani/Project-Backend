const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const authService = require('../services/auth.service');

const register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);
  ApiResponse.created(result, 'User registered successfully').send(res);
});

const login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body);
  ApiResponse.ok(result, 'Login successful').send(res);
});

module.exports = { register, login };
