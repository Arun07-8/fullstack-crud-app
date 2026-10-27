
import express from "express";
import adminController from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/login", adminController.login);
router.post("/logout", adminController.logout);

router.post(
    "/create-user",
    authMiddleware("adminToken", "admin"),
    adminController.createUser
);

router.get(
    "/users",
    authMiddleware("adminToken", "admin"),
    adminController.getUserdata
);

router.put(
    "/edit-user/:id",
    authMiddleware("adminToken", "admin"),
    adminController.editUser
);

router.delete(
    "/delete-user/:id",
    authMiddleware("adminToken", "admin"),
    adminController.deleteUser
);

router.patch(
    "/block-user/:id",
    authMiddleware("adminToken", "admin"),
    adminController.blockUser
);

router.patch(
    "/unblock-user/:id",
    authMiddleware("adminToken", "admin"),
    adminController.unblockUser
);

router.get("/checkadmin", adminController.checkadmin);

export default router;
