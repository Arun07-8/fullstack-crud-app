const jwt = require('jsonwebtoken')
const User = require("../model/userSchema")
const bcrypt = require('bcryptjs')

// Register
exports.register = async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            phoneNumber
        });


        res.status(201).json({
            message: "User registered successfully. Please login...",
            userdata: {
                name: newUser.fullName,
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User not found, please register your account" })
        }
        if (user.isBlocked) {
            return res.status(403).json({
                message: "Your account has been blocked by the admin."
            });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        //  Send cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });


        res.status(200).json({
            message: "Login Successful",
            user: {
                id: user._id,
                name: user.fullName,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server error" });
    }
}

//logout
exports.logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "strict",
            secure: false,
        });
        res.status(200).json({ message: "user logout successfully" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "server  error" })
    }
}

//   check  user data
exports.checkuser = async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(200).json({ authenticated: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(200).json({ authenticated: false });
        }

        res.status(200).json({
            authenticated: true,
            user: {
                id: user._id,
                name: user.fullName,
                email: user.email
            }
        });
    } catch (error) {
        res.status(200).json({ authenticated: false });
    }
};


// upload image

exports.uploadImge=async (req,res) => {
    try {

    const userId = req.user._id
    const user = await User.findByIdAndUpdate(
      userId,
      {profileImage: req.file.filename },
      {new: true}
    )

    if(!user) {
      return res.status(404).json({message: 'User not found'})
    }
    res.status(201).json({success: true, message: 'Image uploaded'})
    
  } catch (error) {
    console.error(error)
    res.status(500).json({message: 'Server error'})
  }
}