const mongoose=require("mongoose");



const connectDB=async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("connected to database successfully");
    }
    catch(err){
        console.log("connection failed ,can't connect to database");
        console.log(err);

          process.exit(1);
    }
}

module.exports = connectDB;