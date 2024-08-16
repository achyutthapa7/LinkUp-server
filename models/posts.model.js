import mongoose from "mongoose";
const postSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    Comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: [],
      },
    ],
    postStatus: {
      type: String,
      enum: ["public", "private", "only to friends"],
      default: "public",
    },
  },
  { timestamps: true }
);
export const postModel = mongoose.model("Post", postSchema);
