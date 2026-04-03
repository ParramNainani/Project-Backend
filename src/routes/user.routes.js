const { Router } = require('express');
const userController = require('../controllers/user.controller');
const { requireAuth, restrictTo } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { updateRoleSchema, updateStatusSchema, userQuerySchema } = require('../validations/user.validation');

const router = Router();

// All user routes require authentication + ADMIN role
router.use(requireAuth, restrictTo('ADMIN'));

router.get('/', validate(userQuerySchema, 'query'), userController.listUsers);
router.patch('/:id/role', validate(updateRoleSchema), userController.updateRole);
router.patch('/:id/status', validate(updateStatusSchema), userController.updateStatus);

module.exports = router;
