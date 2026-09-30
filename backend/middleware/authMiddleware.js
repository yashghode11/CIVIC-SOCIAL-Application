const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try{
        const token=req.cookies.token;
    if(!token){
        return res.status(401).json({
            message:"Unauthorised, Please login first...",
        })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user=decoded;
    next();
    }
    catch(err){
        return res.status(500).json({
            message:"Something went wrong..",
            error:err.message,
        })
    }
};

module.exports={authMiddleware};