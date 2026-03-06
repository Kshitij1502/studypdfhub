const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const adminRoutes = require("./routes/adminAuth");
const pdfRoutes = require("./routes/pdfRoutes");
const systemRoutes = require("./routes/systemRoutes");

const app = express();
const path = require("path");

// Serve uploaded PDFs
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Health endpoint used by frontend when backend is up
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "StudyPdfHub backend is running"
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/api/admin", adminRoutes);
app.use("/api/pdfs", pdfRoutes);
app.use("/api/system", systemRoutes);

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
