const express = require("express");
const router = express.Router();
const {
  createAssign,
  getAllAssigns,
  getAssign,
  updateAssign,
  deleteAssign,
} = require("../controllers/assignController");

router.route("/").post(createAssign).get(getAllAssigns);
router.route("/:id").get(getAssign).put(updateAssign).delete(deleteAssign);

module.exports = router;
