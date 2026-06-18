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
router.get("/:id", get);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;
