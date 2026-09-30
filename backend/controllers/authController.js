const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {

    try {


        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "please provide name, email and password",
            })
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
            })
        }
        const hashedPassword = await bcrypt.hash(password, 15);
        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword,
        })
        await newUser.save();

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }

        });

    }
    catch (err) {
        return res.status(500).json({
            message: "Couldn't create user ,registrtion failed..",
            error: err.message,
        })
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password...",
            })
        }
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({
                message: "No User exists,Please register yourself first...",
            })
        }
        const isCorrectPassword = await bcrypt.compare(password, existingUser.password);
        if (!isCorrectPassword) {
            return res.status(400).json({
                message: "Password is Incorrect please try again ...",
            })
        }
        const token = jwt.sign({
            userId: existingUser._id,
            role: existingUser.role,
        },
            process.env.JWT_SECRET, {
            expiresIn: "1d"
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Logged in successfully",

        })

    }
    catch (err) {
        return res.status(500).json({
            message: "something went wrong in login..",
            error: err.message,
        })
    }
}

module.exports = { registerUser, loginUser };