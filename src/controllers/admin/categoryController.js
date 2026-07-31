import Category from '../../models/category.js';

export const createCategory = async (req, res) => {
  try {
    const categoryName = (req.body.categoryName || req.body.name || req.body.category || '').toString().trim();
    const description = (req.body.description || '').toString().trim();
    
    if (!categoryName) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    // Escape regex characters for safe case-insensitive lookup
    const escapedName = categoryName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const existingCategory = await Category.findOne({
      categoryName: { $regex: new RegExp(`^${escapedName}$`, 'i') },
    });

    if (existingCategory) {
      return res.status(200).json({
        success: true,
        message: 'Category already exists',
        category: { ...existingCategory.toObject(), name: existingCategory.categoryName },
      });
    }

    const category = await Category.create({
      categoryName,
      description,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: { ...category.toObject(), name: category.categoryName },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const rawCategories = await Category.find().sort({ createdAt: -1 });
    const categories = rawCategories.map((c) => ({
      ...c.toObject(),
      name: c.categoryName,
    }));
    res.json({ success: true, count: categories.length, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryName = (req.body.categoryName || req.body.name || req.body.category || '').toString().trim();
    const description = (req.body.description || '').toString().trim();
    const isActive = req.body.isActive;

    const category = await Category.findByIdAndUpdate(
      id,
      { categoryName, description, isActive },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Emit real-time update to all clients so customer store refreshes availability
    if (req.io) {
      req.io.emit('category_status_updated', {
        categoryId: category._id,
        isActive: category.isActive,
        categoryName: category.categoryName,
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      category: { ...category.toObject(), name: category.categoryName },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};