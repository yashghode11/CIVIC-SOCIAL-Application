const express=require("express");
const router = express.Router();
const {registerUser,loginUser}=require("../controllers/authController.js");
const {authMiddleware} = require("../middleware/authMiddleware");

router.post("/register",registerUser);
router.post("/login",loginUser);

router.get("/protected", authMiddleware, (req, res) => {
    res.status(200).json({
        message: "You are authenticated",
        user: req.user
    });
    });

module.exports = router;