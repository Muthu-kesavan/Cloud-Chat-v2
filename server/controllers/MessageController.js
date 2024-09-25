import Message from "../models/MessagesModel.js";
import {mkdirSync, renameSync} from 'fs';

export const getMessages = async(req, res)=>{
  try{
    const user1 = req.userId;
    const user2 = req.body.id;

    if(!user1 || !user2){
      return res.status(400).send("Both user ID is required");
    }
    
    const messages = await Message.find({
      $or:[
        {sender: user1, recipient: user2},
        {sender: user2, recipient: user1},
      ]
    }).sort({timestamp: 1});

    return res.status(200).json({messages});
  } catch(err){
    console.log({err})
    return res.status(500).send("Internal Server Error");
  }
};


export const uploadFile = async(req, res)=> {
  try{
    if(!req.file){
      return res.status(400).send("File is not found");
    }
    const date = Date.now();
    let fileDir = `uploads/files/${date}`;
    let fileName = `${fileDir}/${req.file.originalname}`;

    mkdirSync(fileDir,{recursive:true});

    renameSync(req.file.path, fileName);

    return res.status(200).json({filePath: fileName});

  } catch(err){
    console.log({err});
    return res.status(500).send("Internal Server error");
  }
};


// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const {messageId} = req.params;
    const userId = req.userId;  // Assuming you have the user ID from token

    // Find the message
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if the user is the sender of the message
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: "You are not authorized to delete this message" });
    }

    // Delete the message
    await Message.findByIdAndDelete(messageId);

    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};
