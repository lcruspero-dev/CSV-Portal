import express from "express";
import {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  viewAllTickets,
  viewOpenTickets,
  viewClosedTickets,
  viewTicketsByDepartment,
  viewTicketsByPriority,
  viewTicketsByCategory,
} from "../controllers/ticketController.js";

import { protect, verifyAdmin } from "../middleware/authMiddleware.js";

// Re-route into note router
import noteRouter from "./noteRoutes.js";

const router = express.Router();

router.use("/:ticketId/notes", noteRouter);

// Routes for viewing tickets based on status
router.get("/viewAll", protect, verifyAdmin, viewAllTickets);
router.get("/viewOpen", protect, verifyAdmin, viewOpenTickets);
router.get("/viewClosed", protect, verifyAdmin, viewClosedTickets);
router.get("/category/:category", protect, verifyAdmin, viewTicketsByCategory);

// Routes for viewing tickets based on department and priority
router.get("/department/:dept", protect, verifyAdmin, viewTicketsByDepartment);
router.get("/priority/:level", protect, verifyAdmin, viewTicketsByPriority);

// Protected route to create and get tickets
router.route("/").get(protect, getTickets).post(protect, createTicket);

// Routes for individual ticket operations
router
  .route("/:id")
  .get(protect, getTicket)
  .put(protect, verifyAdmin, updateTicket)
  .delete(protect, verifyAdmin, deleteTicket);

export default router;
