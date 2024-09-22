import mongoose, { Model } from "mongoose";
const ChannelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  members: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Users",
      required: true,
    }
  ],
  admin:{
    type: mongoose.Schema.ObjectId,
    ref: "Users",
    required: true,
  },
  messages: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Messages",
      required: false,
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now(),

  },
  updatedAt:{
    type: Date,
    default: Date.now(),
  },
  isRead: {
    type: Boolean,
    default: false,
  },
});

ChannelSchema.pre("save", function (next){
  this.updatedAt = Date.now();
  next();
});

ChannelSchema.pre("findOneAndUpdate", function (next){
  this.set({updatedAt: Date.now()});
  next();
});

const Channel = mongoose.model("Channels", ChannelSchema);
export default Channel;