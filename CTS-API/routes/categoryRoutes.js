import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getCategoriesByRole,
} from "../controllers/categoryController.js";

const router = express.Router();

router.route("/").post(createCategory).get(getAllCategories);

router
  .route("/:id")
  .get(getCategory)
  .put(updateCategory)
  .delete(deleteCategory);

router.route("/role/:role").get(getCategoriesByRole);

export default router;
