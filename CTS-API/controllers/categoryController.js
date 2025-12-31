import Category from "../models/categoryModel";

// Create new category
export const createCategory = async (req, res) => {
  try {
    const { category, role } = req.body;

    if (!category || !role) {
      return res.status(400).json({
        success: false,
        message: "Please provide both category and role",
      });
    }

    // Check if the category already exists
    const existingCategory = await Category.findOne({ category });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    // If category doesn't exist, create a new one
    const newCategory = await Category.create({
      category,
      role,
    });

    res.status(201).json({
      success: true,
      message: "Created category successfully",
      category: newCategory,
    });

  } catch (error) {
    console.error("Failed to create category", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    // Sort categories based on role
    const sortedCategories = categories.sort((a, b) => {
      if (a.role === "IT" && b.role === "HR") return -1;
      if (a.role === "HR" && b.role === "IT") return 1;
      return 0;
    });

    res.status(200).json({
      success: true,
      message: "Fetch categories",
      count: sortedCategories.length,
      categories: sortedCategories,
    });

  } catch (error) {
    console.error("Failed to fetch categories", error)
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get single category
export const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Fetch category",
      category,
    });

  } catch (error) {
    console.error("Failed to fetch category", error)
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Update category
export const updateCategory = async (req, res) => {

  try {
    const { category: categoryName, role } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Validate role if provided
    if (role && !["HR", "IT"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'HR' or 'IT'",
      });
    }

    if (categoryName) category.category = categoryName;
    if (role) category.role = role;

    await category.save();

    res.status(200).json({
      success: true,
      message: "Update category successfully",
      data: category,
    });

  } catch (error) {
    console.error("Failed to update catefgory ", error)
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: category
    });

  } catch (error) {
    console.error("Failed to delete category", error)
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get categories by role
export const getCategoriesByRole = async (req, res) => {
  try {
    const { role } = req.params;

    if (!["HR", "IT"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Role must be either 'HR' or 'IT'",
      });
    }

    const categories = await Category.find({ role });

    res.status(200).json({
      success: true,
      message: "Fetch categories by role",
      count: categories.length,
      categories,
    });

  } catch (error) {
    console.error("Failed to fetch categories by role", error)
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


