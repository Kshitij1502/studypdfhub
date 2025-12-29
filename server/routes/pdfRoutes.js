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

// GET subjects under course + semester
router.get("/subjects", async (req, res) => {
  const { course, semester } = req.query;

  try {
    const subjects = await Pdf.distinct("subject", {
      course: course.toUpperCase(),
      semester: Number(semester)
    });

    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch subjects" });
  }
});


router.get("/units", async (req, res) => {
  const { course, semester, subject } = req.query;

  const units = await Pdf.distinct("unit", {
    course: course.toUpperCase(),
    semester: Number(semester),
    subject: subject.toLowerCase()
  });

  res.json(units.sort((a, b) => a - b));
});


// ADMIN upload
router.post("/upload", upload.single("pdf"), async (req, res) => {
  const pdf = new Pdf({
    title: req.body.title,
    course: req.body.course.toUpperCase(),
    semester: Number(req.body.semester),
    subject: req.body.subject.toLowerCase(), // normalize
    unit: Number(req.body.unit),              // ✅ SAVE UNIT
    fileUrl: req.file.path.replace(/\\/g, "/")
  });

  await pdf.save();
  res.json({ message: "PDF uploaded successfully" });
});


// PUBLIC fetch
/* router.get("/", async (req, res) => {
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
}); */

//second last change
/* router.get("/", async (req, res) => {
  const { course, semester, subject, unit } = req.query;

  const filter = { course, semester };

  if (subject) filter.subject = subject;
  if (unit) filter.unit = unit;

  const pdfs = await Pdf.find(filter);
  res.json(pdfs);
}); */
router.get("/", async (req, res) => {
  const { course, semester, subject, unit } = req.query;

const query = {};

if (course) query.course = course;
if (semester) query.semester = Number(semester);
if (subject) query.subject = subject.toLowerCase();

// ✅ only filter unit IF provided
if (unit !== undefined) query.unit = Number(unit);

const pdfs = await Pdf.find(query);
res.json(pdfs);

});


// ADMIN delete
router.delete("/:id", auth, async (req, res) => {
  await Pdf.findByIdAndDelete(req.params.id);
  res.json({ message: "PDF deleted" });
});

module.exports = router;
