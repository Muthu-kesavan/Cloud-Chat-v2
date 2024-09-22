import Channel from "../models/ChannelModel.js";
import User from "../models/UserModel.js";
import mongoose from "mongoose";
export const createChannel = async(req, res)=>{
  try{
    const{name, members} = req.body;
    const userId = req.userId;

    const admin = await User.findById(userId);

    if(!admin){
      return res.status(400).send("Admin not found");
    }

    const validMembers = await User.find({ _id: {$in: members}});

    if (validMembers.length !== members.length){
      return res.status(400).send("unvalid user are there");
    }

    const newChannel = new Channel({
      name, 
      members, 
      admin: userId,
    });
    newChannel.save();
    return res.status(201).json({channel: newChannel});
  } catch(err){
    console.log({err});
    return res.status(500).send("Internal Server Error");
  }
};

export const getUserChannel = async (req, res) => {
  try { 
    const userId = new mongoose.Types.ObjectId(req.userId);
    const channels = await Channel.find({ 
      $or: [{ admin: userId }, { members: userId }],
    }).sort({ updatedAt: -1 });
    return res.status(200).json({ channels });
  } catch (err) {
    console.log("Error fetching user channels:", err);
    return res.status(500).send("Internal Server Error");
  }
};

export const getChannelmsg = async (req, res) => {
  try {
    const { channelId } = req.params;
    const channel = await Channel.findById(channelId)
      .populate({
        path: "messages", 
        populate: {
          path: 'sender', 
          select: "name email _id image color",
        },
      });

    if (!channel) {
      return res.status(404).send("Channel not found");
    }
    const messages = channel.messages; 
    return res.status(200).json({ messages }); 
  } catch (err) {
    console.log("Error fetching channel messages:", err); 
    return res.status(500).send("Internal Server Error");
  }
};



