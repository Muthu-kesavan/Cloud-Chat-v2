import Message from "../models/MessagesModel.js";
import { v2 as cloudinary } from 'cloudinary';
import {v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const getResourceType = (fileExtension) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
  const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv'];
  const rawExtensions = ['.pdf', '.docx', '.xlsx', '.pptx', '.txt', '.zip'];

  if (imageExtensions.includes(fileExtension)) return 'image';
  if (videoExtensions.includes(fileExtension)) return 'video';
  if (rawExtensions.includes(fileExtension)) return 'raw';

  return null; 
};

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


export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("File is not found");
    }
    const fileExtension = path.extname(req.file.originalname).toLowerCase(); 
    const resourceType = getResourceType(fileExtension); 

    if (!resourceType) {
      return res.status(400).send("Unsupported file type. Please upload a valid file.");
    }

    const originalFileName = req.file.originalname.replace(/\s+/g, '_'); 
    const unique_Id = `${uuidv4()}/${originalFileName}`;
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        public_id: unique_Id,
        folder: 'chat',
        type: 'upload', 

      },
      (error, result) => {
        if (error) {
          console.error("Upload error:", error);
          return res.status(500).send("Internal Server Error");
        }

       
        return res.status(200).json({ 
          filePath: result.secure_url,
        });
      }
    );

    
    fs.createReadStream(req.file.path).pipe(stream);

  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server error");
  }
};


export const deleteMessage = async (req, res) => {
  try {
    const {messageId} = req.params;
    const userId = req.userId;  

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }


    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: "You are not authorized to delete this message" });
    }

    await Message.findByIdAndDelete(messageId);

    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};
