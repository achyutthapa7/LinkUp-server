import mongoose from "mongoose";
const commentSchema = mongoose.Schema(
  {
    post: String,
    givingUser: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    commentText: {
      type: String,
    },
  },
  { timestamps: true }
);
export const commentModel = mongoose.model("Comment", commentSchema);
