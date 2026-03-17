const express = require("express")
const cors = require("cors")
const app = express()

const adminRoutes = require('./routes/adminRoutes')
const userRoutes = require('./routes/userRoutes')
const connectDB = require('./config/connectDb')
const cookieParser = require("cookie-parser");
require("dotenv").config();

app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads',express.static('uploads'))

app.use('/', userRoutes)
app.use('/admin', adminRoutes)                                                                         

connectDB().then(() => {
  app.listen(5000, () => {
    console.log("Backend server running on http://localhost:5000");
  });
});
