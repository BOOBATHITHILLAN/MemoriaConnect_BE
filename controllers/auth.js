import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { NodeMailer } from "../nodemailer/nodemailer.js";
import dotenv from "dotenv";
dotenv.config();

// REGISTER USER
export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      location,
      occupation,
    } = req.body;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath,
      location,
      occupation,
      viewedProfile: Math.floor(Math.random() * 10000),
      impressions: Math.floor(Math.random() * 10000),
    });
    await newUser.save();
    const randomString =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    const link = `${process.env.FELINK}/activateuser/${randomString}`;

    const sub = "Account Activation"

    NodeMailer(randomString, email, link, res, sub);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Activate User
export const activateUser = async (req, res) => {
  try {
    const token = req.params.id;

    const user = await User.findOne({ token_activate_account: token });

    if (!user) {
      return res.status(400).json({ Message: "User not found or Activated account" });
    }

    user.account_activated = true

    user.token_activate_account = "Account Activated";

    const updated = await User.findByIdAndUpdate(user._id, user);

    if (updated) {
      return res.status(201).json({ Message: "Account activated" });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


/* LOGGING IN */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ msg: "User does not exist. " })
    };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials. " })
    };

    if (user.account_activated) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "2h" });
      return res.status(200).json({ token });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ Err: "please enter valid email" });
    }
    const matchedUser = await User.findOne({ email });
    if (!matchedUser) {
      return res.status(400).json({ Err: "user not found exists" });
    }

    const randomString =
      Math.random().toString(16).substring(2, 15) +
      Math.random().toString(16).substring(2, 15);

    matchedUser.token_reset_password = randomString;

    await User.findByIdAndUpdate(matchedUser.id, matchedUser);

    //sending email for resetting
    const link = `${process.env.FELINK}/forgotpassword/${randomString}`;

    const sub = "Reset password"

    NodeMailer(randomString, email, link, res, sub);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

//Reset Password
export const resetPassword = async (req, res) => {
  try {
    const resetToken = req.params.id;
    const { password } = req.body;
    const matchedUser = await User.findOne({ token_reset_password: resetToken });
    if (matchedUser === null || matchedUser.token_reset_password === "") {
      return res
        .status(400)
        .json({ Err: "user not exists or reset link expired" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    matchedUser.password = hashedPassword;
    matchedUser.token_reset_password = `Password Updated on ${new Date()}`;


    await User.findByIdAndUpdate(matchedUser.id, matchedUser);
    return res.status(201).json({
      message: `${matchedUser.username} password has beed changed sucessfully`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}