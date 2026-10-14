const express = require("express");
const router = express.Router();

const {
    registerComplaint,
    getMyComplaints,
    getComplaint,
    updateComplaintStatus,
    assignComplaint,
    getAssignedComplaints
} = require("../controllers/complaintController.js");

const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/register", authMiddleware, registerComplaint);
router.get("/myComplaints", authMiddleware, getMyComplaints);
router.get("/assigned-complaints", authMiddleware, getAssignedComplaints);
router.get("/:id", authMiddleware, getComplaint);
router.patch("/:id/status", authMiddleware, updateComplaintStatus);
router.patch("/:id/assign", authMiddleware, assignComplaint);



module.exports = router;