const express = require("express");
const multer = require("multer");
const Pdf = require("../models/Pdf");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

// ADMIN upload
router.post("/upload", auth, upload.single("pdf"), async (req, res) => {
const pdf = new Pdf({
  title: req.body.title,
  course: req.body.course.toUpperCase(),
  semester: Number(req.body.semester),
  subject: req.body.subject,
  fileUrl: req.file.path.replace("\\", "/") // Windows fix
});


  await pdf.save();
  res.json({ message: "PDF uploaded successfully" });
});

// PUBLIC fetch
router.get("/", async (req, res) => {
  try {
    const course = req.query.course?.toUpperCase();
    const semester = Number(req.query.semester);

    if (!course || !semester) {
      return res.status(400).json({ message: "Missing course or semester" });
    }

    const pdfs = await Pdf.find({ course, semester });

    res.json(pdfs);
  } catch (err) {
    console.error("PDF fetch failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


// ADMIN delete
router.delete("/:id", auth, async (req, res) => {
  await Pdf.findByIdAndDelete(req.params.id);
  res.json({ message: "PDF deleted" });
});

module.exports = router;
