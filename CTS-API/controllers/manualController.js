const Manual = require('../models/manualModel');
const mongoose = require("mongoose");

// GET /manuals
const index = async (req, res) => {
    try {
        const manuals = await Manual.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: manuals
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// GET /manuals/:id
const show = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid manual ID"
            });
        }

        const manual = await Manual.findById(id);

        if (!manual) {
            return res.status(404).json({
                success: false,
                message: "Manual not found"
            });
        }

        res.status(200).json({
            success: true,
            data: manual
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// POST /manuals
const store = async (req, res) => {
    try {
        const manual = await Manual.create(req.body);

        res.status(201).json({
            success: true,
            data: manual
        });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// PUT /manuals/:id
const update = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid manual ID"
            });
        }

        const manual = await Manual.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!manual) {
            return res.status(404).json({
                success: false,
                message: "Manual not found"
            });
        }

        res.status(200).json({
            success: true,
            data: manual
        });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE /manuals/:id
const destroy = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid manual ID"
            });
        }

        const manual = await Manual.findByIdAndDelete(id);

        if (!manual) {
            return res.status(404).json({
                success: false,
                message: "Manual not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Manual deleted successfully"
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

module.exports = {
    index,
    show,
    store,
    update,
    destroy
};
