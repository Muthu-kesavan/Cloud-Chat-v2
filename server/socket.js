import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import Message from "./models/MessagesModel.js";
import Channel from "./models/ChannelModel.js";
dotenv.config();

const setupSocket = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST", "DELETE"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  const disconnect = (socket) => {
    console.log(`Client disconnected: ${socket.id}`);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  const sendMessage = async (message, callback) => {
    try {
      const senderSocketId = userSocketMap.get(message.sender);
      const recipientSocketId = userSocketMap.get(message.recipient);

      const createdMessage = await Message.create(message);

      const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "id email name image color")
        .populate("recipient", "id email name image color");

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("recieveMessage", messageData);
      }

      if (senderSocketId) {
        io.to(senderSocketId).emit("recieveMessage", messageData);
      }

      if (callback) callback({ status: "ok", messageData });

    } catch (error) {
      console.error("Error sending message:", error);
      if (callback) callback({ status: "error", error: error.message });
    }
  };

  const deleteMessage = async (messageId, callback) => {
    try {
      const deletedMessage = await Message.findByIdAndDelete(messageId);

      if (!deletedMessage) {
        return callback({ status: "error", error: "Message not found" });
      }

      // Notify relevant users (sender and recipient)
      const senderSocketId = userSocketMap.get(deletedMessage.sender.toString());
      const recipientSocketId = userSocketMap.get(deletedMessage.recipient.toString());

      // Find the channel ID if applicable (you might have a way to get it)
      const channelId = deletedMessage.channelId || null; // Assuming channelId is in the message schema

      if (senderSocketId) {
        io.to(senderSocketId).emit("messageDeleted", { messageId, channelId });
      }

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("messageDeleted", { messageId, channelId });
      }

      if (callback) callback({ status: "ok", messageId });

    } catch (error) {
      console.error("Error deleting message:", error);
      if (callback) callback({ status: "error", error: error.message });
    }
  };

  const sendChannelMessage = async (message, callback) => {
    try {
      const { channelId, sender, content, messageType, fileUrl, location } = message;

      const createdMessage = await Message.create({
        sender,
        recipient: null,
        content,
        messageType,
        timestamp: new Date(),
        fileUrl,
        location,
      });

      const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "id email name image color")
        .exec();

      await Channel.findByIdAndUpdate(channelId, {
        $push: { messages: createdMessage._id },
      });

      const channel = await Channel.findById(channelId).populate("members");

      const finalData = { ...messageData._doc, channelId: channel._id };

      if (channel && channel.members) {
        channel.members.forEach((member) => {
          const memberSocketId = userSocketMap.get(member._id.toString());
          if (memberSocketId) {
            io.to(memberSocketId).emit("recieve-channel-message", finalData);
          }
        });

        const adminSocketId = userSocketMap.get(channel.admin._id.toString());
        if (adminSocketId) {
          io.to(adminSocketId).emit("recieve-channel-message", finalData);
        }
      }

    } catch (error) {
      console.error("Error sending channel message:", error);
      if (callback) callback({ status: "error", error: error.message });
    }
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User connected: ${userId} with socket ${socket.id}`);
    } else {
      console.log("UserId not provided during connection");
    }

    socket.on("sendMessage", (message, callback) => sendMessage(message, callback));
    socket.on("deleteMessage", (messageId, callback) => deleteMessage(messageId, callback)); // Add deletion event
    socket.on("send-channel-message", (message, callback) => sendChannelMessage(message, callback));

    socket.on("disconnect", () => disconnect(socket));
  });
};

export default setupSocket;