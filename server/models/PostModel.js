import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
},
description: {
    type: String,
    max: 350,
},
picture:{
  type: String,
},
video: {
  type: String,
},

likes: {
    type: Array,
    default: [],
},

saved: {
  type: Array,
  default: [],
},

replies: [
  {
      userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
          required: true,
      },
      text: {
          type: String,
          required: true,
      },
      image: {
          type: String,
      },
      name: {
          type: String,
      },
      color: {
        type: Number,
      },
  },
],
},
{
  timestamps: true,
})

const Post = mongoose.model("Post", PostSchema);
export default Post;