import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  lat: { 
    type: Number, 
    required: true 
  },
  long: 
  { type: Number,
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

const Location = mongoose.model("Location", locationSchema);
export default Location;
