const { Router } = require('express');
const recordController = require('../controllers/record.controller');
const { requireAuth, restrictTo } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createRecordSchema, updateRecordSchema, recordQuerySchema } = require('../validations/record.validation');

const router = Router();

// All record routes require authentication
router.use(requireAuth);

router.get('/', restrictTo('ANALYST', 'ADMIN'), validate(recordQuerySchema, 'query'), recordController.getRecords);
router.post('/', restrictTo('ADMIN'), validate(createRecordSchema), recordController.createRecord);
router.put('/:id', restrictTo('ADMIN'), validate(updateRecordSchema), recordController.updateRecord);
router.delete('/:id', restrictTo('ADMIN'), recordController.deleteRecord);

module.exports = router;
