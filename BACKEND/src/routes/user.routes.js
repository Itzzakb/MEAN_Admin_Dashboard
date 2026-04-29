const express = require('express');
const { body } = require('express-validator');
const { getUsers, getUser, updateUser, deleteUser, updateProfile } = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin'), getUsers);
router.get('/:id', authorize('admin'), getUser);
router.put('/profile', updateProfile);
router.put('/:id', authorize('admin'), [
  body('name').optional().trim().isLength({ min: 2 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(['admin', 'user']),
  body('status').optional().isIn(['active', 'inactive']),
], updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
