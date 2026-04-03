const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const recordService = require('../services/record.service');

const createRecord = catchAsync(async (req, res) => {
  const record = await recordService.createRecord(req.body, req.user.id);
  ApiResponse.created(record, 'Record created successfully').send(res);
});

const getRecords = catchAsync(async (req, res) => {
  const result = await recordService.getRecords(req.validatedQuery || req.query);
  ApiResponse.ok(result, 'Records retrieved successfully').send(res);
});

const updateRecord = catchAsync(async (req, res) => {
  const record = await recordService.updateRecord(req.params.id, req.body);
  ApiResponse.ok(record, 'Record updated successfully').send(res);
});

const deleteRecord = catchAsync(async (req, res) => {
  const result = await recordService.deleteRecord(req.params.id);
  ApiResponse.ok(result, 'Record deleted successfully').send(res);
});

module.exports = { createRecord, getRecords, updateRecord, deleteRecord };
