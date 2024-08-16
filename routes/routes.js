import express from "express";
import {
  acceptRequest,
  addProfilePicture,
  changePassword,
  changeProfilePicture,
  changeUserName,
  confirmPassword,
  createPassword,
  createUserName,
  forgetPassword,
  getFriendsProfile,
  getUserById,
  getUserProfile,
  login,
  logout,
  registration,
  rejectRequest,
  removeFriend,
  resetPassword,
  sendFriendRequests,
  verification,
} from "../controllers/user.controllers.js";
import { authentication } from "../auth/auth.js";
const router = express.Router();
import multer from "multer";
import {
  addPostImage,
  createPost,
  deletePost,
  getPost,
  likePost,
} from "../controllers/post.controllers.js";
import {
  createComment,
  getComments,
} from "../controllers/comments.controllers.js";

router.post("/registration", registration);
router.post("/verification/:emailAddress", verification);
router.post("/createUserName/:emailAddress", createUserName);
router.put("/changeUserName", authentication, changeUserName);
router.post("/createPassword/:emailAddress", createPassword);
router.post("/confirmPassword/:emailAddress", confirmPassword);
router.put("/changePassword", authentication, changePassword);
router.post("/forgetPassword", forgetPassword);
router.post("/resetPassword", resetPassword);
router.post("/logout", authentication, logout);
router.post("/login", login);
router.get("/getUserProfile", authentication, getUserProfile);
router.get("/getFriendsProfile", authentication, getFriendsProfile);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post(
  "/addProfilePicture/:emailAddress",
  upload.single("profileImage"),
  addProfilePicture
);

router.post(
  "/changeProfilePicture",
  authentication,
  upload.single("profileImage"),
  changeProfilePicture
);
router.post("/sendFriendRequest/:id", authentication, sendFriendRequests);
router.post("/acceptRequest/:id", authentication, acceptRequest);
router.post("/rejectRequest/:id", authentication, rejectRequest);
router.post("/removeFriend/:id", authentication, removeFriend);

router.post(
  "/addPostImages",
  authentication,
  upload.array("postImage", 5),
  addPostImage
);
router.post("/createPost/:id", authentication, createPost);
router.get("/getPost/:id", authentication, getPost);
router.post("/deletePost/:id", authentication, deletePost);
router.post("/likePost/:id", authentication, likePost);
router.post("/createComment/:id", authentication, createComment);
router.get("/getComments/:id", getComments);

router.get("/getUserById/:id", getUserById);
export { router };
