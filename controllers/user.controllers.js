import { userModel } from "../models/users.model.js";
import { postModel } from "../models/posts.model.js";
import sendOtp from "../helpers/sendOtp.js";
import cron from "node-cron";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { commentModel } from "../models/Comments.model.js";
// Cron job to delete unverified users with expired verification codes every 5 minutes
cron.schedule("*/5 * * * *", async (req, res) => {
  try {
    const result = await userModel.deleteMany({
      isVerified: false,
    });
    if (result.deletedCount > 0) {
      console.log(
        `Deleted ${result.deletedCount} unverified users with expired verification codes.`
      );
    }
  } catch (error) {
    console.error(`Error while deleting unverified users: ${error.message}`);
  }
});

//registration
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

//verification
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

//create username
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

//change username
export const changeUserName = async (req, res) => {
  const emailAddress = req.rootUser.emailAddress;
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
      .json({ message: "username updated successfully", user: updatedUser });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "An error occurred while creating username." + error.message,
    });
  }
};

//create password
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

//confirm password
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
    // const updatedUser = await userModel.findOne(
    //   { emailAddress },
    //   { new: true }
    // );
    res.status(200).json({
      message: "You are registered successfully",
      user,
      token,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "An error occurred while confirming password." + error.message,
    });
  }
};

//change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const emailAddress = req.rootUser.emailAddress;
    const user = await userModel.findOne({ emailAddress });
    const passwordIsCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!passwordIsCorrect) {
      return res.status(402).json({ message: "Current password is incorrect" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await userModel.findOneAndUpdate(
      { emailAddress },
      { $set: { password: hashedPassword } },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Password updated successfully", user: updatedUser });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "An error occurred while changing password." + error.message,
    });
  }
};

//forgot password
export const forgetPassword = async (req, res) => {
  const verificationCode = Math.floor(Math.random() * 89999 + 10000).toString();
  const title = "Reset Your Password";
  const heading = "Reset Your Password";
  const paragraph =
    "Forgot Your Password? Your password will be reset when you verify your one time password";
  try {
    const { emailAddress } = req.body;
    const user = await userModel.findOne({ emailAddress: emailAddress });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // sendOtp(verificationCode, emailAddress, title, heading, paragraph);
    const updatedUser = new userModel.findOneAndUpdate(
      { emailAddress },
      { passwordVerificationCode: verificationCode },
      { new: true }
    );
    await updatedUser.save();
    res.status(200).json({
      message: "one time password is sent to" + emailAddress,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message:
        "An error occurred while sending password reset email." + error.message,
    });
  }
};

//reset password
export const resetPassword = async (req, res) => {
  try {
    const { passwordVerificationCode, newPassword } = req.body;
    const user = await userModel.findOne({
      passwordVerificationCode,
    });
    if (!user) {
      return res
        .status(404)
        .json({ message: "password verification code is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await userModel.findOneAndUpdate(
      { passwordVerificationCode },
      { $set: { password: hashedPassword } },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Password reset successfully", user: updatedUser });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "An error occurred while resetting password." + error.messgae,
    });
  }
};

//add profile picture
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

//update profile picture
export const changeProfilePicture = async (req, res) => {
  const url = `http://localhost:4000/images/${req.file.filename}`;
  const emailAddress = req.rootUser.emailAddress;
  try {
    const user = await userModel.findOneAndUpdate(
      { emailAddress },
      { $set: { profilePicture: url } }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res
      .status(200)
      .json({ message: "Profile picture updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while changing profile picture" });
  }
};

//login
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

//logout
export const logout = async (req, res) => {
  try {
    const emailAddress = req.rootUser.emailAddress;
    const user = await userModel.findOneAndUpdate(
      { emailAddress },
      { $set: { isLoggedIn: false } },
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

//get user profile
export const getUserProfile = async (req, res) => {
  try {
    const emailAddress = req.rootUser.emailAddress;

    const user = await userModel
      .findOne({ emailAddress })
      .select("-password")
      .populate({
        path: "posts",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "Comments", // Assuming your posts model has a field 'Comments'
          options: { sort: { createdAt: -1 } }, // Optional: sort Comments by createdAt
        },
      })
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

//get friends profile
export const getFriendsProfile = async (req, res) => {
  try {
    const id = req.rootUser._id;
    const friendsProfile = await userModel
      .find({ acceptedRequests: id })
      .select("-password")
      .populate({
        path: "posts",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "Comments",
          options: { sort: { createdAt: -1 } },
          populate: {
            path: "givingUser",
          },
        },
      });
    if (!friendsProfile) {
      return res.status(404).json({ message: "Friends not found" });
    }
    res.status(200).json({ message: "Friends Profile", friendsProfile });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ message: "An error occurred while getting Friends Profile" });
  }
};

//send friend request
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

//accept friend request
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

//reject friend request
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

//remove friend
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

export const getUserById = async (req, res) => {
  const { id } = req.params;
  const user = await userModel.findOne({ _id: id });
  res.json({ user });
};
