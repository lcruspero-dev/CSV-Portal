import express from "express";
import {
  createAssign,
  getAllAssigns,
  getAssign,
  updateAssign,
  deleteAssign,
} from "../controllers/assignController.js";

const router = express.Router();

router.route("/").post(createAssign).get(getAllAssigns);
router.route("/:id").get(getAssign).put(updateAssign).delete(deleteAssign);

export default router;

