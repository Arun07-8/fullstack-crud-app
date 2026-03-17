const multer = require("multer");

const storage = multer.diskStorage({
 destination: (req, file, cb) => {
   cb(null, "uploads/");
 },
 filename: (req, file, cb) => {
   cb(null, Date.now() + "-" + file.originalname);
 }
});

const upload = multer({ storage });

router.post("/upload", upload.single("profileImage"), async (req, res) => {

   const imagePath = req.file.filename;

   await User.findByIdAndUpdate(req.user.id,{
        profileImage: imagePath
   });

   res.json({ message: "Image uploaded" });
});