import mongoose from "mongoose";
const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    emailAddress: {
      type: String,
      required: true,
      unique: true,
    },
    userName: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      minlength: 8,
    },
    profileStatus: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    profilePicture: {
      type: String,
      default: "https://via.placeholder.com/300",
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    acceptedRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    pendingRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    sentRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    verificationCode: {
      type: Number,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    isLoggedIn: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const userModel = mongoose.model("User", userSchema);
