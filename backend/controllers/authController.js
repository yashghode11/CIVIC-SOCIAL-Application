const User=require("../models/User.js");
const bcrypt = require("bcryptjs");

const registerUser = async (req, res) => {

   try{

    
    const{name,email,password}=req.body;
    if(!name || !email || !password){
        return res.status(400).json({
            message:"please provide name, email and password",
        })
    }
    const existingUser = await User.findOne({ email });
    if(existingUser){
        return res.status(400).json({
            message:"User already exists",
        })
    }
    const hashedPassword = await bcrypt.hash(password, 15);
    const newUser=new User({
        name:name,
        email:email,
        password:hashedPassword,
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
   catch(err){
    return res.status(500).json({
        message:"Couldn't create user ,registrtion failed..",
        error:err.message,
    })
   }
};


module.exports = {registerUser};