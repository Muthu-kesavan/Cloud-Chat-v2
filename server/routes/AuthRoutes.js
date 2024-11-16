import {Router} from "express";
import { signup, login, getUserInfo, updateProfile, uploadImage, removeImage, logout, getUser } from "../controllers/AuthController.js";
import {verifyToken} from "../middlewares/AuthMiddleware.js";
import multer from "multer";

const authRoutes = Router();
const upload = multer({dest: "uploads/profiles/"});
authRoutes.post('/signup',signup );
authRoutes.post('/login',login);
//authRoutes.post('/verify-otp', verifyOTP);
authRoutes.get('/user-info',verifyToken, getUserInfo);
authRoutes.post('/update-profile',verifyToken, updateProfile);
authRoutes.post('/upload-image', verifyToken, upload.single("profile-image"), uploadImage);
authRoutes.delete('/remove-image', verifyToken, removeImage );
authRoutes.get('/find/:id', getUser);
authRoutes.post('/logout', logout);
export default authRoutes;
