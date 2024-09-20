import {Router} from "express";
import {verifyToken} from "../middlewares/AuthMiddleware.js";
import { createChannel, getChannelmsg, getUserChannel } from "../controllers/ChannelController.js";

const channelRoutes = Router();

channelRoutes.post("/create-channel", verifyToken, createChannel);
channelRoutes.get("/get-user-channels", verifyToken, getUserChannel);
channelRoutes.get("/channel-messages/:channelId", verifyToken, getChannelmsg);
export default channelRoutes;