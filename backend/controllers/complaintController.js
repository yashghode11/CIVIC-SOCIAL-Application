const Complaint = require("../models/Complaint.js");

const registerComplaint = async (req, res) => {
    try {
        const { title, description, category } = req.body;
        if (!title || !description || !category) {
            return res.status(400).json({
                message: "Please provide all required fields...",

            });
        }
        const reportedBy = req.user.userId;

        if (!reportedBy) {
            return res.status(400).json({
                message: "User not found... login first to register complaint",
            });
        }
        const newComplaint = new Complaint({
            title,
            description,
            category,
            reportedBy,
        });
        await newComplaint.save();
        return res.status(201).json({
            message: "Complaint registered successfully",
            complaint: newComplaint,
        });

    }
    catch (err) {
        return res.status(500).json({
            message: "Something went wrong..",
            error: err.message,
        })
    }
}
const getMyComplaints = async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return res.status(400).json({
                message: "User not found... login first to view complaints",
            });
        }
        const allComplaints = await Complaint.find({ reportedBy: userId });
        return res.status(200).json({
            message: "All complaints fetched successfully " + userId,
            complaints: allComplaints,
        });
    }
    catch (err) {
        return res.status(500).json({
            message: "Something went wrong..",
            error: err.message,
        })

    }
}

const getComplaint = async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return res.status(400).json({
                message: "User not found... login first to view complaints",
            });
        }
        const complaintId = req.params.id;
        const complaint = await Complaint.findOne({
            _id: complaintId,
            reportedBy: userId,
        });
        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found",
            });
        }
        return res.status(200).json({
            message: "Complaint fetched successfully",
            complaint: complaint,
        });
    }
    catch (err) {
        return res.status(500).json({
            message: "Something went wrong..",
            error: err.message,
        })
    }
}

module.exports = { registerComplaint, getMyComplaints, getComplaint };