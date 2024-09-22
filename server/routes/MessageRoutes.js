import {Router} from "express";
import {verifyToken} from "../middlewares/AuthMiddleware.js";
import { getMessages,sendLocation,uploadFile } from "../controllers/MessageController.js";
import multer from "multer";

const messagesRoutes = Router();

const upload = multer({dest:"uploads/files"});

messagesRoutes.post("/upload", verifyToken, upload.single("file"), uploadFile);
messagesRoutes.post("/get-messages", verifyToken, getMessages);
messagesRoutes.post('/send', verifyToken, sendLocation);
export default messagesRoutes;
