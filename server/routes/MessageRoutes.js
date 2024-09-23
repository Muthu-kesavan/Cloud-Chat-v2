import {Router} from "express";
import {verifyToken} from "../middlewares/AuthMiddleware.js";
import {getMessages,uploadFile } from "../controllers/MessageController.js";
import multer from "multer";

const messagesRoutes = Router();

const upload = multer({dest:"uploads/files"});

messagesRoutes.post("/upload", verifyToken, upload.single("file"), uploadFile);
messagesRoutes.post("/get-messages", verifyToken, getMessages);
export default messagesRoutes;
