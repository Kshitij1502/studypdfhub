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
    course: req.body.course,
    semester: req.body.semester,
    subject: req.body.subject,
    fileUrl: req.file.path
  });

  await pdf.save();
  res.json({ message: "PDF uploaded successfully" });
});

// PUBLIC fetch
router.get("/", async (req, res) => {
  const { course, semester } = req.query;
  const pdfs = await Pdf.find({ course, semester });
  res.json(pdfs);
});

// ADMIN delete
router.delete("/:id", auth, async (req, res) => {
  await Pdf.findByIdAndDelete(req.params.id);
  res.json({ message: "PDF deleted" });
});

module.exports = router;
