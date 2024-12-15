import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt;
  // console.log({token});
  if (!token) {
    return res.status(401).send("You are not authenticated");
  }
  
  jwt.verify(token, process.env.JWT, (err, payload) => {
    if (err) {
      console.error('Token verification error:', err); // Log the error for debugging
      return res.status(403).send("Token is not valid or has expired");
    }
    
    req.userId = payload.userId;
    next();
  });
};

