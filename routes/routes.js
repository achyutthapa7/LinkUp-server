import express from "express";
import {
  acceptRequest,
  addProfilePicture,
  confirmPassword,
  createPassword,
  createUserName,
  getUserProfile,
  login,
  logout,
  registration,
  rejectRequest,
  removeFriend,
  sendFriendRequests,
  verification,
} from "../controllers/user.controllers.js";
import { authentication } from "../auth/auth.js";
const router = express.Router();
import multer from "multer";
import {
  addProductImage,
  createPost,
  deletePost,
  getPost,
} from "../controllers/post.controllers.js";

router.post("/registration", registration);
router.post("/verification/:emailAddress", verification);
router.post("/createUserName/:emailAddress", createUserName);
router.post("/createPassword/:emailAddress", createPassword);
router.post("/confirmPassword/:emailAddress", confirmPassword);
router.post("/logout", authentication, logout);
router.post("/login", login);
router.get("/getUserProfile", authentication, getUserProfile);

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


router.post("/sendFriendRequest/:id", authentication, sendFriendRequests);
router.post("/acceptRequest/:id", authentication, acceptRequest);
router.post("/rejectRequest/:id", authentication, rejectRequest);
router.post("/removeFriend/:id", authentication, removeFriend);


router.post(
  "/addProductImages",
  authentication,
  upload.array("postImage", 5),
  addProductImage
);
router.post("/createPost/:id", authentication, createPost);
router.get("/getPost/:id", authentication, getPost);
router.post("/deletePost/:id", authentication, deletePost);



export { router };
