import { postModel } from "../models/posts.model.js";
import { userModel } from "../models/users.model.js";

// post images
export const addPostImage = async (req, res) => {
  try {
    const files = req.files.map((file) => {
      return `http://localhost:4000/images/${file.filename}`;
    });
    if (!files) {
      res.status(201).json({ message: "post without images", files });
    }
    res.status(200).json({ message: "Success", files });
  } catch (error) {
    res.status(500).json({
      message:
        "An error occurred while adding the product image." + error.message,
    });
  }
};

// create post
export const createPost = async (req, res) => {
  const { content, postStatus, images } = req.body;
  try {
    const newPost = new postModel({
      content,
      postStatus,
      user: req.rootUser._id,
      images,
    });
    await newPost.save();
    const user = await userModel
      .findOneAndUpdate(
        { _id: req.rootUser._id },
        { $push: { posts: newPost._id } },
        { new: true }
      )
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json({ message: "Post created successfully", newPost, user });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while creating the post." + error.message,
    });
  }
};

// delete post
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
// get post
export const getPost = async (req, res) => {
  try {
    const post = await postModel
      .findById({ _id: req.params.id })
      .populate("user")
      .populate("likes")
      .populate("Comments")
      .sort({ createdAt: -1 });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while fetching the post." + error.message,
    });
  }
};
//like post
export const likePost = async (req, res) => {
  try {
    const currentUser = await userModel.findOne({ _id: req.rootUser._id });
    const post = await postModel.findOne({ _id: req.params.id });
    if (!currentUser || !post) {
      return res.status(404).json({ message: "Not found" });
    }
    if (currentUser.posts.includes(req.params.id)) {
      return res.status(402).json({ message: "cannot like your own post" });
    }
    if (post.likes.includes(currentUser._id)) {
      await postModel.findOneAndUpdate(
        { _id: req.params.id },
        { $pull: { likes: currentUser._id } }
      );
      return res.status(401).json({ message: "Post is disliked" });
    }
    await postModel.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { likes: currentUser._id } }
    );
    res.status(200).json({ message: "Post liked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// comment on post
