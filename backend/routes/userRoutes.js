const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const authMiddleware = require("../middleware/authMiddleware")

router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/logout', userController.logout)
router.get('/checkuser',userController.checkuser)
// router.post('/upload',)

module.exports = router