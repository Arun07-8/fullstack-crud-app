const express = require('express')
const router = express.Router()
const adminController = require("../controllers/adminController")
const authMiddleware=require('../middleware/authMiddleware')

router.post('/login', adminController.login);
router.post('/logout', adminController.logout);

router.post('/create-users', authMiddleware, adminController.createUser);  
router.get('/users', authMiddleware, adminController.getUserdata);     
router.put('/users/:id', authMiddleware, adminController.editUser);   
router.delete('/delete-user/:id', authMiddleware, adminController.deleteUser); 

router.patch('/block-user/:id', authMiddleware, adminController.blockUser);
router.patch('/unblock-user/:id', authMiddleware, adminController.unblockUser);

module.exports = router;


