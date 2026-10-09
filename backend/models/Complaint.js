const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            enum: [
                "ROAD",
                "ELECTRICITY",
                "GARBAGE",
                "STREETLIGHT",
                "WATER",
                "DRAINAGE",
                "TRAFFIC",
                "PUBLIC_PROPERTY",
                "ENVIRONMENT",
                "SANITATION",
                "OTHER"
            ]
        },

        priority: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            default: "MEDIUM"
        },

        status: {
            type: String,
            enum: [
                "REPORTED",
                "UNDER_REVIEW",
                "ASSIGNED",
                "IN_PROGRESS",
                "RESOLVED",
                "VERIFIED",
                "REOPENED"
            ],
            default: "REPORTED"
        },

        location: {
            type: String,
            
        },

        images: {
            type: [String],
            default: []
        },

        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        department: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

const Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = Complaint;
