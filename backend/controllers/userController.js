
import jwt from "jsonwebtoken";
import User from "../model/userSchema.js";
import bcrypt from "bcryptjs";
import uploadImge from "../service/uploadService.js";

// Register
const register = async (req, res) => {
  try {

    const { fullName, email, password, phoneNumber } = req.body;

    const existingUser = await User.findOne({ email, role: "user" });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
    });

    res.status(201).json({
      message: "User registered successfully. Please login...",
      userdata: {
        name: newUser.fullName,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login
const login = async (req, res) => {
  try {

    const { email, password } = req.body;
    const user = await User.findOne({ email, role: "user" });
    if (!user) {
      return res.status(400).json({
        message: "User not found, please register your account",
      });
    }
    if (user.role === "admin") {
      return res.status(403).json({
        message: "User not found",
      });
    }
    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked by the admin.",
      });
    }


    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
    const token = jwt.sign(
      { id: user._id.toString(), role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("userToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login Successful",
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout
const logout = async (req, res) => {
  try {
  res.clearCookie("userToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });

    res.status(200).json({
      message: "user logout successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "server error" });
  }
};

// Check user
const checkuser = async (req, res) => {
  try {
    const token = req.cookies?.userToken;;
    if (!token) {
      console.log("true")
      return res.status(200).json({ authenticated: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user || user.isBlocked) {
      return res.status(200).json({ authenticated: false });
    }

    res.status(200).json({
      authenticated: true,
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    res.status(200).json({ authenticated: false });
  }
};

;

const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image",
      });
    }

    const result = await uploadImge(req.file.buffer);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: result.secure_url },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile image uploaded successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Image upload failed",
    });
  }
};



export default {
  register,
  login,
  logout,
  checkuser,
  uploadProfileImage,
};
