import { userModel } from "../models/users.model.js";
import { postModel } from "../models/posts.model.js";
import sendOtp from "../helpers/sendOtp.js";
import cron from "node-cron";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// cron.schedule("*/5 * * * *", async (req, res) => {
//   try {
//     const result = await userModel.deleteMany({
//       isVerified: false,
//     });
//     if (result.deletedCount > 0) {
//       console.log(
//         `Deleted ${result.deletedCount} unverified users with expired verification codes.`
//       );
//     }
//   } catch (error) {
//     console.error(`Error while deleting unverified users: ${error.message}`);
//   }
// });

export const registration = async (req, res) => {
  const { firstName, lastName, dateOfBirth, gender, emailAddress } = req.body;
  //5 digits otp
  const verificationCode = Math.floor(Math.random() * 89999 + 10000).toString();
  const title = "verify your email";
  const heading = "verify your email";
  const paragraph =
    "Thank you for registering with us. Please use the verification code below to complete your registration:";
  try {
    const emailAddressExists = await userModel.findOne({ emailAddress });
    if (emailAddressExists) {
      return res.status(402).json({ message: "Email address already exists" });
    }
    const user = new userModel({
      firstName,
      lastName,
      dateOfBirth,
      gender,
      emailAddress,
      verificationCode,
    });
    await user.save();

    res.status(200).json({ message: "Success", user });
    // sendOtp(verificationCode, emailAddress, title, heading, paragraph);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "An error occurred while registering the user." + error.message,
    });
  }
};

export const verification = async (req, res) => {
  try {
    const { verificationCode } = req.body;
    const emailAddress = req.params.emailAddress;
    const user = await userModel.findOne({ emailAddress });

    if (!verificationCode && (user || !user))
      return res
        .status(403)
        .json({ message: "Please provide verification code" });
    if (!user)
      return res.status(404).json({ message: "You have to register first" });

    if (user.isVerified == true)
      return res.status(201).json({ message: "You are verified" });
    if (verificationCode == user.verificationCode) {
      await userModel.updateOne(
        { emailAddress },
        {
          $set: {
            isVerified: true,
          },
        },
        { new: true }
      );
      const updatedUser = await userModel.findOne({ emailAddress });
      return res
        .status(200)
        .json({ message: "Verification successful", user: updatedUser });
    } else {
      return res.status(401).json({ message: "Verification code is wrong" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "An error occurred while verifying the user." + error.message,
    });
  }
};

export const createUserName = async (req, res) => {
  const emailAddress = req.params.emailAddress;
  try {
    const user = await userModel.findOne({
      emailAddress,
    });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    const { userName } = req.body;
    const userNameExsits = await userModel.findOne({ userName });
    if (userNameExsits) {
      return res
        .status(402)
        .json({ message: "username already in use, try another" });
    }
    const updatedUser = await userModel.findOneAndUpdate(
      { emailAddress },
      { $set: { userName } },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "username created successfully", user: updatedUser });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "An error occurred while creating username." + error.message,
    });
  }
};

export const createPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const emailAddress = req.params.emailAddress;
    const user = await userModel.findOne({ emailAddress });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    const updatedUser = await userModel.findOneAndUpdate(
      { emailAddress },
      { $set: { password: hashedPassword } },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "password created successfully", user: updatedUser });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "An error occurred while creating password." + error.message,
    });
  }
};

export const confirmPassword = async (req, res) => {
  try {
    const { confirmPassword } = req.body;
    const emailAddress = req.params.emailAddress;
    const user = await userModel.findOne({ emailAddress });
    const token = await jwt.sign({ _id: user._id }, process.env.SECRET_KEY);
    const passwordIsCorrect = await bcrypt.compare(
      confirmPassword,
      user.password
    );
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    if (!passwordIsCorrect) {
      return res.status(402).json({ message: "password doesn't match" });
    }
    res.cookie("token", token);
    const updatedUser = await userModel.findOneAndUpdate(
      { emailAddress },
      { $set: { isLoggedIn: true } },
      { new: true }
    );
    res.status(200).json({
      message: "You are registered successfully",
      user: updatedUser,
      token,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "An error occurred while confirming password." + error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { userName, password, emailAddress } = req.body;
    const user = await userModel.findOne({
      $or: [{ userName }, { emailAddress }],
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const passwordIsCorrect = await bcrypt.compare(password, user.password);
    if (!passwordIsCorrect) {
      return res.status(402).json({ message: "Incorrect password" });
    }
    const token = await jwt.sign({ _id: user._id }, process.env.SECRET_KEY);
    await user.updateOne({ isLoggedIn: true }, { new: true });
    res.cookie("token", token);
    res
      .status(200)
      .json({ message: "You are logged in successfully", user, token });
  } catch (error) {
    console.error(error.message);
    res.status(500).json;
  }
};

export const logout = async (req, res) => {
  try {
    const emailAddress = req.rootUser.emailAddress;
    const user = await userModel.findOneAndUpdate(
      { emailAddress },
      { isLoggedIn: false },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.clearCookie("token");
    res.status(200).json({ message: "You are logged out successfully", user });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "An error occurred while logging out." });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const emailAddress = req.rootUser.emailAddress;

    const user = await userModel
      .findOne({ emailAddress })
      .select("-password")
      .populate("posts")
      .populate("acceptedRequests")
      .populate("pendingRequests")
      .populate("sentRequests");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User profile", user });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ message: "An error occurred while getting user profile." });
  }
};

export const addProfilePicture = async (req, res) => {
  try {
    const url = `http://localhost:4000/images/${req.file.filename}`;
    const emailAddress = req.params.emailAddress;
    const user = await userModel.findOneAndUpdate(
      { emailAddress },
      { profilePicture: url },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res
      .status(200)
      .json({ message: "Profile picture added successfully", user });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ message: "An error occurred while adding profile picture." });
  }
};

export const sendFriendRequests = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.rootUser._id });
    const friend = await userModel.findOne({ _id: req.params.id });
    if (!user || !friend) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      friend.pendingRequests.includes(user._id) ||
      user.sentRequests.includes(friend._id)
    ) {
      return res.status(402).json({
        message: "You have already sent a friend request to this user.",
      });
    }
    if (
      friend.acceptedRequests.includes(user._id) &&
      user.acceptedRequests.includes(friend._id)
    ) {
      return res.status(402).json({
        message: "You are already friends",
      });
    }
    friend.pendingRequests.push(user._id);
    user.sentRequests.push(friend._id);
    await user.save();
    await friend.save();
    res
      .status(200)
      .json({ message: "Friend request sent successfully", user, friend });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ message: "An error occurred while sending friend requests." });
  }
};

export const acceptRequest = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.rootUser._id });
    const friend = await userModel.findOne({ _id: req.params.id });

    if (!user || !friend) {
      return res.status(404).json({ message: "User not found" });
    }
    if (
      friend.acceptedRequests.includes(user._id) &&
      user.acceptedRequests.includes(friend._id)
    ) {
      return res.status(402).json({
        message: "You are already friends",
      });
    }
    if (!user.sentRequests.includes(friend._id)) {
      return res.status(404).json({ message: "Request to friend" });
    }

    friend.acceptedRequests.push(user._id);
    user.acceptedRequests.push(friend._id);
    friend.pendingRequests.pull(user._id);
    user.sentRequests.pull(friend._id);
    await user.save();
    await friend.save();
    res
      .status(200)
      .json({ message: "Friend request accepted successfully", user, friend });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ message: "An error occurred while accepting friend requests." });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.rootUser._id });
    const friend = await userModel.findOne({ _id: req.params.id });
    if (!user || !friend) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.sentRequests.includes(friend._id)) {
      return res.status(404).json({ message: "Request to friend" });
    }
    if (
      friend.acceptedRequests.includes(user._id) &&
      user.acceptedRequests.includes(friend._id)
    ) {
      return res.status(402).json({
        message: "You are already friends",
      });
    }
    friend.pendingRequests.pull(user._id);
    user.sentRequests.pull(friend._id);
    await user.save();
    await friend.save();
    res.status(200).json({ message: "friend request rejected", user, friend });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ message: "An error occurred while rejecting friend requests." });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.rootUser._id });
    const friend = await userModel.findOne({ _id: req.params.id });
    if (!user || !friend) {
      return res.status(404).json({ message: "User not found" });
    }
    if (
      friend.acceptedRequests.includes(user._id) &&
      user.acceptedRequests.includes(friend._id)
    ) {
      friend.acceptedRequests.pull(user._id);
      user.acceptedRequests.pull(friend._id);
    } else if (
      friend.pendingRequests.includes(user._id) &&
      user.pendingRequests.includes(friend._id)
    ) {
      friend.pendingRequests.pull(user._id);
      user.sentRequests.pull(friend._id);
    } else {
      return res.status(404).json({
        message: "You are not friends with this user",
      });
    }
    await user.save();
    await friend.save();
    res
      .status(200)
      .json({ message: "friend successfully removed", user, friend });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ message: "An error occurred while removing friends." });
  }
};
