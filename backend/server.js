const express=require("express");
const app=express();
const dotenv=require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB=require("./config/db.js");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

connectDB();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.get("/",(req,res)=>{
    res.send("i am yash, a software developer...");
})



const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
   
    console.log("the backend server is listening.....");
})