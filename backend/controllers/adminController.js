const jwt = require('jsonwebtoken');
const User = require("../model/userSchema");
const bcrypt = require('bcryptjs');

// Admin Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await User.findOne({ email, role: 'admin' });

        if (!admin) {
            return res.status(401).json({ message: "Admin access denied or account not found" });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Admin Login Successfully",
            admindata: {
                id: admin._id,
                name: admin.fullName,
                email: admin.email,
                role: admin.role
            }
        });

    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ message: "Server error during admin login" });
    }
};

// Admin Logout
exports.logout = async (req, res) => {
    try {
        res.clearCookie("adminToken", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });
        res.status(200).json({ message: "admin logout successfully" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "server  error" })
    }
}

exports.getUserdata = async (req, res) => {
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
                { phoneNumber: { $regex: search, $options: "i" } }
            ]
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
}

// create new user

exports.createUser = async (req, res) => {
    try {
        const { fullName, email, phoneNumber, password } = req.body

        const exisitingUser = await User.findOne({ email })
        if (exisitingUser) {
            return res.status(400).json({ message: "This account already exists" })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedpassword = await bcrypt.hash(password, salt)

        const newUser = await User.create({
            fullName,
            email,
            password: hashedpassword,
            phoneNumber
        })

        res.status(201).json({
            message: "User added successfully....",
        });

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server error" });
    }
}

// editUser
exports.editUser = async (req, res) => {
    try {
        let { fullName, email, phoneNumber } = req.body
        const userId = req.params.id

        fullName = fullName?.trim();
        email = email?.trim().toLowerCase();
        phoneNumber = phoneNumber?.trim();

        if (!fullName || !email || !phoneNumber) {
            return res.status(400).json({ success: false, message: "All fields required" });
        }
        let existingUser = await User.findOne({ email, _id: { $ne: userId } })
        if (existingUser) {
            if (existingUser.role == "admin") {
                return res.status(400).json({ success: false, message: "This email is already used by admin" });
            } else {
                return res.status(400).json({ success: false, message: "Email already exists" });
            }

        }

        const user = await User.findByIdAndUpdate(
            userId,
            { fullName, email, phoneNumber },
            { returnDocument: 'after' }
        );
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ message: "User updated successfully" })
    } catch (error) {
        console.error(error)
        res.status(500).send({ message: 'Server error' })
    }
}

// block user 
exports.blockUser = async (req, res) => {
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
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: `The user account ${user.fullName} has been successfully blocked.`
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
exports.unblockUser = async (req, res) => {
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
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: `The user account ${user.fullName} has been successfully unblocked.`
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// delete user
exports.deleteUser = async (req, res) => {
    try {
        const id = req.params.id
        const user = await User.findByIdAndDelete(id)
        res.status(200).json({ message: `The user account ${user.fullName} has been successfully deleted.` })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}
