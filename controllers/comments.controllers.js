import { commentModel } from "../models/Comments.model.js";
import { postModel } from "../models/posts.model.js";
export const createComment = async (req, res) => {
  try {
    const { comment } = req.body;
    const newComment = new commentModel({
      post: req.params.id,
      givingUser: req.rootUser._id,
      commentText: comment,
    });

    await newComment.save();
    await postModel.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { Comments: newComment } }
    );
    res.status(201).json({ comment: newComment });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while creating the comment." + error.message,
    });
  }
};

export const getComments = async (req, res) => {
  try {
    const comments = await commentModel
      .find({ receivingUser: req.params.id })
      .populate("receivingUser")
      .populate("givingUser")
      .sort({ createdAt: -1 });
    res.status(200).json({ comments });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while retrieving comments." + error.message,
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await commentModel.findByIdAndDelete(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while deleting the comment." + error.message,
    });
  }
};
