
import express from "express";
import userController from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../config/multer.js";

const router = express.Router();

// Public routes
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/checkuser", userController.checkuser);

// User-only protected route
router.post(
  "/profile/upload",
  authMiddleware("userToken", "user"),
  upload.single("image"),
  userController.uploadProfileImage
);

export default router;
