const express = require("express");

const {
  createMemo,
  getMemos,
  getMemoById,
  updateMemo,
  deleteMemo,
  publishMemo,
  archiveMemo,
} = require("../controllers/memoBuilderController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(authorizeRoles("SUPERADMIN", "HR", "IT"), getMemos)
  .post(authorizeRoles("SUPERADMIN", "HR", "IT"), createMemo);

router
  .route("/:memoId")
  .get(getMemoById)
  .patch(authorizeRoles("SUPERADMIN", "HR", "IT"), updateMemo)
  .delete(authorizeRoles("SUPERADMIN", "HR", "IT"), deleteMemo);

router.patch(
  "/:memoId/publish",
  authorizeRoles("SUPERADMIN", "HR", "IT"),
  publishMemo,
);

router.patch(
  "/:memoId/archive",
  authorizeRoles("SUPERADMIN", "HR", "IT"),
  archiveMemo,
);

module.exports = router;
