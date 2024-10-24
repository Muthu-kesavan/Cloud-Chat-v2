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
  origin:[process.env.ORIGIN],
  methods:["GET","POST","PUT","PATCH","DELETE"],
  credentials: true,
}))

// app.use('/uploads/profiles', express.static("uploads/profiles"));
// app.use("/uploads/files", express.static("uploads/files"));
// app.use("/uploads/posts", express.static("uploads/posts"));

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

mongoose.connect(dataBase_url).then(()=>{
  console.log("Database connected sucessfully!!")
}).catch((err)=>{
  console.log(err.message);
})


