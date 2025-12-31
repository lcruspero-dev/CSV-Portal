import User from "../models/userModel";
import Note from "../models/noteModel";
import Ticket from "../models/ticketModel";

export const getNotes = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or not authenticated",
      });
    }

    const ticket = await Ticket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticketing not found",
      });
    }

    if (ticket.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({
        success: false,
        message: "User not authorized",
      });
    }

    const notes = await Note.find({
      ticket: req.params.ticketId,
    });

    res.status(200).json({
      success: true,
      message: "Fetch Notes",
      data: notes,
    });
  } catch (error) {
    console.error("", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const addNote = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or not authenticated",
      });
    }

    // Get the ticket
    const ticket = await Ticket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (ticket.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "User not authorized to add note",
      });
    }

    // Create the note
    const note = await Note.create({
      ticket: req.params.ticketId,
      text: req.body.text,
      isStaff: false,
      user: req.user.id,
      name: req.user.name,
    });

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      data: note,
    });
  } catch (error) {
    console.error("", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
