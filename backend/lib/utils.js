import jwt from "jsonwebtoken";

export const generateToken=(userId,res)=>{
    const token=jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:"7d"});
    res.cookie("jwt",token,{
        httpOnly:true, // prevent XSS attacks : cross site scripting
        sameSite:"strict", // prevent CSRF attacks : cross site request forgery
        secure:process.env.NODE_ENV==="production" ? true : false, // only send cookie over HTTPS in production
        maxAge:7*24*60*60*1000 //MS 7 days
    });
    return token;
};