const Product = require('../models/Product');
const { sendSuccess, sendError } = require('../utils/response.utils');

/**
 * Enrich a raw DB product row with derived / computed fields
 * so the frontend always receives a consistent, safe shape.
 */
function enrichProduct(product) {
  if (!product) return null;

  // Derive stock status
  let stockStatus = 'out_of_stock';
  if (product.stock > 5)      stockStatus = 'in_stock';
  else if (product.stock > 0) stockStatus = 'low_stock';

  return {
    ...product,
    // Ensure numeric types
    price: Number(product.price),
    stock: Number(product.stock),
    // Computed helpers
    stock_status: stockStatus,
    // image_url already exists; ensure it is string | null
    image_url: product.image_url || null,
    // created_at as ISO string for consistent parsing on frontend
    created_at: product.created_at ? new Date(product.created_at).toISOString() : null,
  };
}

// ─── GET /api/products ────────────────────────────────────────────────────────
const getProducts = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);

    const { rows, total } = await Product.findAll(page, limit);

    return sendSuccess(res, {
      products: rows.map(enrichProduct),
      pagination: {
        currentPage:  page,
        totalPages:   Math.ceil(total / limit),
        totalItems:   total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/products/:id ────────────────────────────────────────────────────
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return sendError(res, 'Product ID must be a valid number.', 400);
    }

    const product = await Product.findById(Number(id));

    if (!product) {
      return sendError(res, 'Product not found.', 404);
    }

    return sendSuccess(res, { product: enrichProduct(product) });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/products ───────────────────────────────────────────────────────
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, category, image_url } = req.body;

    const insertId = await Product.create({
      name,
      description,
      price:      parseFloat(price),
      stock:      parseInt(stock) || 0,
      category,
      image_url,
      created_by: req.user.id,
    });

    const product = await Product.findById(insertId);

    return sendSuccess(res, { product: enrichProduct(product) }, 'Product created successfully.', 201);
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/products/:id ─────────────────────────────────────────────────
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return sendError(res, 'Product ID must be a valid number.', 400);
    }

    const existing = await Product.findById(Number(id));
    if (!existing) {
      return sendError(res, 'Product not found.', 404);
    }

    await Product.delete(Number(id));
    return sendSuccess(res, {}, 'Product deleted successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProductById, createProduct, deleteProduct };
