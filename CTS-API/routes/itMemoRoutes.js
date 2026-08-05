const express = require("express");
const router = express.Router();

const {
  index,
  get,
  create,
  update,
  remove,
  checkAcknowledgement,
} = require("../controllers/itMemo");

const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, index);

router.get("/employee/:employeeId", protect, checkAcknowledgement);

router.get("/:id", protect, get);

router.post("/", protect, create);
router.put("/:id", protect, update);
router.delete("/:id", protect, remove);

module.exports = router;
