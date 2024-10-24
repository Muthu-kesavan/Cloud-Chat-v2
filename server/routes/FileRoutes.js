import {Router} from "express";
import {fileDownload} from "../controllers/FileController.js"

const fileRoutes = Router();

fileRoutes.get('/download-file', fileDownload);

export default fileRoutes;