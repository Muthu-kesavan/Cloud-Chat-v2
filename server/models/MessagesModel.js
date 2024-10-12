import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: false,
  },
  messageType: {
    type: String,
    enum: ["text", "file", "location", "post"],  // Add "post" to the enum
    required: true,
  },
  content: {
    type: String,
    required: function () {
      return this.messageType === "text";
    },
  },
  fileUrl: {
    type: String,
    required: function () {
      return this.messageType === "file";
    },
  },
  location: {
    lat: {
      type: Number,
      required: function () {
        return this.messageType === "location";
      },
    },
    long: {
      type: Number,
      required: function () {
        return this.messageType === "location";
      },
    },
  },
  post: {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",  // Reference the Post model
    },
    description: String,  // Post description
    link: String,  // URL of the shared post
    imageUrl: String,  // URL if the post contains an image
    videoUrl: String,  // URL if the post contains a video
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model("Messages", messageSchema);
export default Message;
