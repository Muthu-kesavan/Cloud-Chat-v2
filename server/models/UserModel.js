import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: [true, "Email need to be unique"],
  },
  password: {
    type: String,
    required: function() { return this.isVerified; },
  },
  name: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
  color: {
    type: Number,
    required: false,
  },
  profileSetup: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  },
  savedPosts: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Post" 
    }
  ],
});


const User = mongoose.model("Users", userSchema);
export default User;
