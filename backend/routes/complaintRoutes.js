const express = require("express");
const router = express.Router();
const {registerComplaint,getMyComplaints,getComplaint}=require("../controllers/complaintController.js");
const {authMiddleware} = require("../middleware/authMiddleware");

router.post("/register",authMiddleware,registerComplaint);
router.get("/myComplaints",authMiddleware,getMyComplaints);
router.get("/:id",authMiddleware,getComplaint);

module.exports=router;