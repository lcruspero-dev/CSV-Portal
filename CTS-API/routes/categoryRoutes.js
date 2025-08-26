// routes/categoryRoutes.js
const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getCategoriesByRole,
} = require("../controllers/categoryController");

router.route("/").post(createCategory).get(getAllCategories);

router
  .route("/:id")
  .get(getCategory)
  .put(updateCategory)
  .delete(deleteCategory);

router.route("/role/:role").get(getCategoriesByRole);

module.exports = router;
