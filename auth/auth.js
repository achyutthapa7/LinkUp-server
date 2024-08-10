import jwt from "jsonwebtoken";
import { userModel } from "../models/users.model.js";

export async function authentication(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(404).json({ message: "Login First" });
    const isVerify = await jwt.verify(token, process.env.SECRET_KEY);
    if (!isVerify) return res.status(404).json({ message: "Login First" });
    const rootUser = await userModel.findOne({ _id: isVerify._id });
    req.rootUser = rootUser;
    next();
  } catch (err) {
    console.log(`Error while authentication: ${err.message}`);
  }
}
