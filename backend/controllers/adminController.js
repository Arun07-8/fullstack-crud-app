
import jwt from "jsonwebtoken";
import User from "../model/userSchema.js";
import bcrypt from "bcryptjs";

// Admin Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await User.findOne({ email, role: "admin" });

    if (!admin) {
      return res.status(401).json({
        message: "Admin access denied or account not found",
      });
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const authCookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    };

    const token = jwt.sign(
      { id: admin._id.toString(), role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("adminToken", token, authCookieOptions);

    res.status(200).json({
      message: "Admin Login Successfully",
      admindata: {
        id: admin._id,
        name: admin.fullName,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error during admin login" });
  }
};

// Admin Logout
const logout = async (req, res) => {
  try {
    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    res.status(200).json({
      message: "Admin logout successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "server error" });
  }
};

// Get users with pagination and search
const getUserdata = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const query = {
      role: "user",
      $or: [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ],
    };

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(query);

    res.send({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "This account already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
    });

    res.status(201).json({
      message: "User added successfully....",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Edit user
const editUser = async (req, res) => {
  try {
    let { fullName, email, phoneNumber } = req.body;
    const userId = req.params.id;

    fullName = fullName?.trim();
    email = email?.trim().toLowerCase();
    phoneNumber = phoneNumber?.trim();

    if (!fullName || !email || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    const existingUser = await User.findOne({
      email,
      _id: { $ne: userId },
    });

    if (existingUser) {
      const message =
        existingUser.role === "admin"
          ? "This email is already used by admin"
          : "Email already exists";

      return res.status(400).json({ success: false, message });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { fullName, email, phoneNumber },
      { returnDocument: "after" }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Block user
const blockUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `The user account ${user.fullName} has been successfully blocked.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Unblock user
const unblockUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `The user account ${user.fullName} has been successfully unblocked.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      message: `The user account ${user.fullName} has been successfully deleted.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const checkadmin = async (req, res) => {
  try {
    const token = req.cookies?.adminToken;

    if (!token) {
      return res.json({ authenticated: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.json({ authenticated: false });
    }

    const admin = await User.findById(decoded.id).select("-password");

    if (!admin || admin.role !== "admin") {
      return res.json({ authenticated: false });
    }

    return res.json({
      authenticated: true,
      user: {
        id: admin._id,
        name: admin.fullName,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    return res.json({ authenticated: false });
  }
};
export default {
  login,
  logout,
  getUserdata,
  createUser,
  editUser,
  blockUser,
  unblockUser,
  deleteUser,
  checkadmin
};
