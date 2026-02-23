const express = require('express');
const router = express.Router();

const { getProducts, getProductById, createProduct, deleteProduct } = require('../controllers/product.controller');
const { createProductValidator } = require('../validators/product.validator');
const validate = require('../middlewares/validate.middleware');
const { protect } = require('../middlewares/auth.middleware');

// GET /api/products          – public
router.get('/', getProducts);

// GET /api/products/:id      – public
router.get('/:id', getProductById);

// POST /api/products         – protected (logged-in users only)
router.post('/', protect, createProductValidator, validate, createProduct);

// DELETE /api/products/:id  – protected (logged-in users only)
router.delete('/:id', protect, deleteProduct);

module.exports = router;
