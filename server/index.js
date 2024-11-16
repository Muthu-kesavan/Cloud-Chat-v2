import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/AuthRoutes.js";
import contactRoutes from "./routes/ContactRoutes.js";
import setupSocket from "./socket.js";
import messagesRoutes from "./routes/MessageRoutes.js";
import channelRoutes from "./routes/ChannelRoutes.js";
import postRoutes from "./routes/PostRoutes.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const dataBase_url = process.env.DATABASE_URL;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true               
}));


app.use(cookieParser());
app.use(express.json());


app.use("/api/auth",authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/channel", channelRoutes);
app.use("/api/post", postRoutes);


const server = app.listen(port, ()=>{
  console.log(`http://localhost:${port}`);
})

setupSocket(server);

const connectToDB = async () => {
  try {
    await mongoose.connect(dataBase_url);
    console.log("Database connected successfully!!");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    setTimeout(connectToDB, 5000); 
  }
};

connectToDB();


