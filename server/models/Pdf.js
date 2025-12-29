const mongoose = require("mongoose");

const pdfSchema = new mongoose.Schema({
  title: String,
  course: String,
  semester: Number,
  subject: String,
  fileUrl: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Pdf", pdfSchema);
