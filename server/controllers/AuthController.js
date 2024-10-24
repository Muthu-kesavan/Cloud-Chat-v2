import { compare } from "bcrypt";
import path from 'path';
import cloudinary from "cloudinary";
import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import {renameSync, unlinkSync} from "fs"
dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const validTime = 2 * 24 * 60 * 60 * 1000;

const Token = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT, { expiresIn: validTime });
};

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email', 
  port: 587, 
  secure: false, 
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASSWORD, 
  },
  tls: {
    rejectUnauthorized: false, 
  },
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Email and password are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).send("Email already in use");
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 

    await User.create({
      email,
      otp,
      otpExpires,
      isVerified: false,
    });

    let mailOptions = {
      from: '"Cloud-Chat ☁️👻" <cloudchatinc@email.com>',
      to: email,
      subject: 'Your OTP for Signup',
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
      console.error('Error sending OTP email:', error);
        return res.status(500).send(`Error sending OTP: ${error.message}`);
      } else {
        console.log('Email sent: ' + info.response);
        return res.status(200).send("OTP sent to your email");
      }
    });
    
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send("User not found");
    }

    if (user.otp !== otp.trim() || user.otpExpires < Date.now()) {
      return res.status(400).send("Invalid or expired OTP");
    }

    user.otp = undefined; 
    user.otpExpires = undefined;
    user.isVerified = true;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      //console.log("Hashed password before saving:", hashedPassword);
      user.password = hashedPassword;
    }

    await user.save();

   
    const updatedUser = await User.findOne({ email });
    //console.log("User saved with hashed password:", updatedUser.password);

    res.cookie("jwt", Token(email, updatedUser.id), {
      maxAge: validTime,
      secure: true,
      sameSite: "None",
    });

    return res.status(200).json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        profileSetup: updatedUser.profileSetup,
      },
    });
  } catch (error) {
    //console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};



export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("Invalid email or password");
    }

    if (!user.isVerified) {
      return res.status(400).send("Please verify your email first");
    }
    
    const isMatch = await compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).send("Invalid email or password");
    }

    res.cookie("jwt", Token(email, user.id), {
      maxAge: validTime,
      secure: true,
      sameSite: "None",
    });

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
        name: user.name,
        image: user.image,
        color: user.color,
      },
    });
  } catch (error) {
    //console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};

export const getUserInfo = async(req, res)=> {
  try{
    const userData = await User.findById(req.userId);
    if (!userData){
      return res.status(404).send("User not found");
    }
    //console.log('user Data:', userData);
    return res.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      name: userData.name,
      image: userData.image,
      color: userData.color,
  });
  }catch(err){
    console.log({err});
    return res.status(500).send("Internal server error");
  }
}

export const updateProfile = async(req, res)=> {
  try{
    const {userId} = req;
    const {name, color} = req.body;
    if (!name){
      return res.status(400).send("Name and color is required");
    }

    const userData = await User.findByIdAndUpdate(
      userId, {
      name, 
      color, 
      profileSetup: true,
    }, 
      {new: true, runValidators: true}
    );
    //console.log("Updated user data:", userData);
    return res.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      name: userData.name,
      image: userData.image,
      color: userData.color,
  });
  }catch(err){
    console.log({err});
    return res.status(500).send("Internal server error");
  }
}

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("File is required");
    }

    const allowedExtensions = ['.jpg', '.jpeg', '.png',];
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).send("Only .jpg, .jpeg, and .png files are allowed");
    }

    // Upload image to Cloudinary
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: 'profiles', // Cloudinary folder to store the profile images
      public_id: `${req.userId}_${Date.now()}`, // Naming the file uniquely
      resource_type: 'image',
      overwrite: true,
    });

    if (!result) {
      return res.status(500).send("Failed to upload the image to Cloudinary");
    }

    // Store the Cloudinary URL in the user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { image: result.secure_url }, // Use the secure Cloudinary URL
      { new: true, runValidators: true }
    );

    // Remove the file from the local uploads folder if needed
    unlinkSync(req.file.path);

    return res.status(200).json({
      image: updatedUser.image,
    });
  } catch (err) {
    console.error({ err });
    return res.status(500).send("Internal Server Error");
  }
};


export const removeImage = async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).send("User not found");
    }

    if (user.image) {
      // Extract public ID from the image URL
      const publicId = user.image.split('/').pop().split('.')[0]; // Get the public ID from the URL

      // Delete the image from Cloudinary
      await cloudinary.v2.uploader.destroy(`profiles/${publicId}`, { resource_type: 'image' });
    }

    // Update the user image field to null
    user.image = null;
    await user.save();

    return res.status(200).send("Profile image removed successfully");
  } catch (err) {
    console.log({ err });
    return res.status(500).send("Internal Server Error");
  }
};
export const logout = async(req, res)=>{
  try{
    res.cookie("jwt", "",{maxAge:1, secure:true, sameSite: "None"})
    return res.status(200).send("Logout successful");
  } catch(err){
    console.log({err});
    return res.status(500).send("Internal Server Error");
  }
};

export const getUser = async(req, res)=>{
  try{
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  }catch(err){
    console.log({err});
    return res.status(500).send("Internal Server error");
  }
}