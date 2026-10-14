
const Complaint = require("../models/Complaint.js");
const User = require("../models/User.js");

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
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(401).json({
                message: "User not found. Please login again",
            });
        }
        
        const complaintId = req.params.id;
        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found",
            });
        }
        if (existingUser.role === "CITIZEN" && complaint.reportedBy.toString() !== existingUser._id.toString()) {
            return res.status(403).json({
                message: "You are not the owner of this complaint",
            });
        }
        if (existingUser.role === "WORKER" && complaint.assignedTo?.toString() !== existingUser._id.toString()) {
            return res.status(403).json({
                message: "You are not assigned to this complaint",
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

const updateComplaintStatus = async (req, res) => {
    const allowedStatuses = [
        "REPORTED",
        "UNDER_REVIEW",
        "ASSIGNED",
        "IN_PROGRESS",
        "RESOLVED",
        "VERIFIED",
        "REOPENED"
    ];

    const allowedTransitions = {
        ADMIN: {
            REPORTED: ["UNDER_REVIEW"],
            UNDER_REVIEW: ["ASSIGNED"],
            
            IN_PROGRESS: [],
            RESOLVED: ["REOPENED"],
            VERIFIED: [],
            REOPENED: ["UNDER_REVIEW"]
        },
        WORKER: {
            ASSIGNED: ["IN_PROGRESS"],
            IN_PROGRESS: ["RESOLVED"]
        }
    };

    try {
        const { status } = req.body;

        // 1. Validate status
        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid complaint status"
            });
        }

        // 2. Find complaint
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found"
            });
        }

        // 3. Find logged-in user
        const existingUser = await User.findById(req.user.userId);

        if (!existingUser) {
            return res.status(401).json({
                message: "User not found. Please login again"
            });
        }

        // 4. Check permissions
        if (existingUser.role === "CITIZEN") {
            return res.status(403).json({
                message: "Citizens cannot update complaint status"
            });
        }

        if (
            existingUser.role === "WORKER" &&
            String(complaint.assignedTo) !== String(existingUser._id)
        ) {
            return res.status(403).json({
                message: "You can only update complaints assigned to you"
            });
        }


        const currentStatus = complaint.status;
        const userRole = existingUser.role;

        const allowedNextStatuses = allowedTransitions[userRole]?.[currentStatus] || [];

        if (!allowedNextStatuses.includes(status)) {
            return res.status(400).json({
                message: `Cannot change status from ${currentStatus} to ${status} as ${userRole}`
            });
        }
        if(status==complaint.status){
            return res.status(400).json({
                message: `Complaint is already in ${status} status`
            });
        }

        // 5. Update and save
        complaint.status = status;
        await complaint.save();

        return res.status(200).json({
            message: "Complaint status updated successfully",
            complaint
        });

    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({
                message: "Invalid complaint ID"
            });
        }

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
};

const assignComplaint=async(req,res)=>{
    try{
        const{workerID}=req.body;
        const existingUser = await User.findById(req.user.userId);
        const complaint = await Complaint.findById(req.params.id);
        if (!workerID) {
            return res.status(400).json({
                message: "Please provide workerID to assign complaint",
            });
        }
        const worker = await User.findById(workerID);


        if (!existingUser) {
            return res.status(401).json({
                message: "User not found. Please login again"
            });
        }
        if(existingUser.role!=="ADMIN"){
            return res.status(403).json({
                message: "Only admins can assign complaints to workers"
            });
        }

        if (!complaint ) {
            return res.status(404).json({
                message: "Complaint not found"
            });
        }
        if(complaint.assignedTo){
            return res.status(400).json({
                message: "Complaint is already assigned to a worker",
                workerID:complaint.assignedTo,
                complaint,

            });
        }
        if(complaint.status!=="UNDER_REVIEW"  && complaint.status!=="REOPENED"){  
            return res.status(400).json({
                message: "Complaint must be in UNDER_REVIEW or REOPENED status to be assigned"
            });
        }


        if (!worker || worker.role !== "WORKER") {
            return res.status(404).json({
                message: "Worker not found.Please provide valid worker",
            });
        }
        


        complaint.assignedTo = workerID;
        complaint.status = "ASSIGNED";
        await complaint.save();

        return res.status(200).json({
            message: "Complaint assigned successfully",
            complaint
        });

    }
    catch(err){
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message,
        });
    }
}
const getAssignedComplaints=async(req,res)=>{
    try{
        const existingUser = await User.findById(req.user.userId);
        if (!existingUser) {
            return res.status(401).json({
                message: "User not found. Please login again"
            });
        }
        if(existingUser.role!=="WORKER"){
            return res.status(403).json({
                message: "Only workers can view assigned complaints"
            });
        }
        const assignedComplaints = await Complaint.find({ assignedTo: existingUser._id })
        .populate("reportedBy", "name email role")
        .populate("assignedTo", "name email role");

        return res.status(200).json({
            message: "Assigned complaints retrieved successfully",
            complaints: assignedComplaints
        });
    }
    catch(err){
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message,
        });
    }
}

module.exports = { registerComplaint, getMyComplaints, getComplaint, updateComplaintStatus,assignComplaint ,getAssignedComplaints};