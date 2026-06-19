const express = require("express");
const router = express.Router();
const {
  index,
  get,
  create,
  update,
  remove,
} = require("../controllers/teaController");
const { protect } = require("../middleware/authMiddleware");

//Crud operations
router.get("/", index, protect);
router.get("/:id", get, protect);
router.post("/", create, protect);
router.put("/:id", update, protect);
router.delete("/:id", remove, protect);

module.exports = router;
