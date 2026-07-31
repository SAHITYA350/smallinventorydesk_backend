import mongoose from 'mongoose';
import Product from '../../models/product.js';
import Category from '../../models/category.js';

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, sku, imageUrl, isAvailable } = req.body;

    if (!name || !name.toString().trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ success: false, message: 'Price must be a valid positive number' });
    }

    const parsedStock = Number(stock);
    const validStock = isNaN(parsedStock) || parsedStock < 0 ? 0 : parsedStock;

    let categoryId = null;
    if (category && category !== 'all' && mongoose.Types.ObjectId.isValid(category)) {
      const categoryExists = await Category.findById(category);
      if (categoryExists) {
        categoryId = category;
      }
    }

    // Generate unique SKU
    const uniqueSku = (sku && sku.toString().trim())
      ? sku.toString().trim()
      : `SKU-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const product = await Product.create({
      name: name.toString().trim(),
      description: description ? description.toString().trim() : '',
      price: parsedPrice,
      stock: validStock,
      category: categoryId,
      sku: uniqueSku,
      imageUrl: imageUrl || '',
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    });

    res.status(201).json({ success: true, message: 'Product created successfully', product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category', 'categoryName description').sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }

    const product = await Product.findById(id).populate('category', 'categoryName description');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }

    if (updates.category) {
      if (updates.category === 'all' || !mongoose.Types.ObjectId.isValid(updates.category)) {
        updates.category = null;
      }
    } else {
      updates.category = null;
    }

    if (updates.price !== undefined) {
      const p = Number(updates.price);
      if (isNaN(p) || p < 0) {
        return res.status(400).json({ success: false, message: 'Price must be a valid positive number' });
      }
      updates.price = p;
    }

    if (updates.stock !== undefined) {
      const s = Number(updates.stock);
      updates.stock = isNaN(s) || s < 0 ? 0 : s;
    }

    const product = await Product.findByIdAndUpdate(id, updates, { returnDocument: 'after', runValidators: true }).populate(
      'category',
      'categoryName'
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product updated successfully', product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
