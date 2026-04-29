const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const authMiddleware = require("../middleware/authMiddleware")
const {upload} =require('../config/multer')
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/logout', userController.logout)
router.get('/checkuser',userController.checkuser)
router.post('/profile/upload/:id',authMiddleware ,upload.single('image'),userController.uploadImge)

module.exports = router