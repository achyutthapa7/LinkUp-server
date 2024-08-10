import { postModel } from "../models/posts.model.js";
import { userModel } from "../models/users.model.js";

export const addProductImage = async (req, res) => {
  try {
    const files = req.files.map((file) => {
      return `http://localhost:4000/images/${file.filename}`;
    });
    res.json(files);
  } catch (error) {
    res.status(500).json({
      message:
        "An error occurred while adding the product image." + error.message,
    });
  }
};

export const createPost = async (req, res) => {
  const { content, postStatus, images } = req.body;
  try {
    const newPost = new postModel({
      content,
      user: req.rootUser._id,
      images,
    });
    await newPost.save();
    await userModel.findOneAndUpdate(
      { _id: req.rootUser._id },
      { $push: { posts: newPost._id } },
      { new: true }
    );
    res.status(200).json({ message: "Post created successfully", newPost });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while creating the post." + error.message,
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await postModel.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    await userModel.findOneAndUpdate(
      { _id: req.rootUser._id },
      { $pull: { posts: req.params.id } },
      { new: true }
    );
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while deleting the post." + error.message,
    });
  }
};

export const getPost = async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id).populate("user");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json({ post });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while fetching the post." + error.message,
    });
  }
};
