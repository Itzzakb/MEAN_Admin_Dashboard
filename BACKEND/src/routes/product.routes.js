const express = require('express');
const { body } = require('express-validator');
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

const productValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Product name must be at least 2 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isIn(['Electronics', 'Clothing', 'Books', 'Food', 'Sports', 'Other']).withMessage('Invalid category'),
];

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', authorize('admin'), productValidation, createProduct);
router.put('/:id', authorize('admin'), productValidation, updateProduct);
router.delete('/:id', authorize('admin'), deleteProduct);

module.exports = router;
