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
// Set the host to 0.0.0.0 and port from environment variables
//const port = process.env.PORT || 10000;  // Use Render's default port or fallback to 10000
//const host = "0.0.0.0";  // Bind to 0.0.0.0 for external access

const dataBase_url = process.env.DATABASE_URL;

app.use(cors({
  origin: ['http://localhost:5173', 'https://cloudchatinc.netlify.app'],// Allow your frontend's URL
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/channel", channelRoutes);
app.use("/api/post", postRoutes);

// Setup the server to listen on the dynamic port
const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// Increase timeout settings to avoid worker timeouts
//server.keepAliveTimeout = 120000;  // 120 seconds
//server.headersTimeout = 120000;    // 120 seconds

// Initialize WebSocket
setupSocket(server);

// Database connection with retry mechanism
const connectToDB = async () => {
  try {
    await mongoose.connect(dataBase_url);
    console.log("Database connected successfully!!");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    setTimeout(connectToDB, 5000);  // Retry after 5 seconds
  }
};

connectToDB();
