import Location from "../models/LocationModel.js";
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

}


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

export const shareLocation = async(req, res)=>{
  const { lat, long } = req.body;
  const userId = req.userId; 
  try {
    const newLocation = new Location({ userId, lat, long});
    await newLocation.save();
    res.status(200).json({ message: "Location shared successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const allLocations = async(req, res)=> {
  const userId = req.userId;

  try {
    const locations = await Location.find({ userId });
    if (locations.length === 0) {
      return res.status(404).json({ message: "No locations found" });
    }
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
