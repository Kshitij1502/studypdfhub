const express = require("express");
const Admin = require("../models/Admin");
const SiteConfig = require("../models/SiteConfig");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

const getOrCreateConfig = async () => {
  let config = await SiteConfig.findOne();
  if (!config) {
    config = await SiteConfig.create({ maintenanceMode: false });
  }
  return config;
};

router.get("/status", async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    res.status(200).json({
      success: true,
      maintenanceMode: config.maintenanceMode
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.put("/maintenance", auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "Admin access only"
      });
    }

    const { maintenanceMode } = req.body;

    if (typeof maintenanceMode !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "maintenanceMode must be boolean"
      });
    }

    const config = await getOrCreateConfig();
    config.maintenanceMode = maintenanceMode;
    await config.save();

    res.status(200).json({
      success: true,
      maintenanceMode: config.maintenanceMode,
      message: maintenanceMode
        ? "Maintenance mode enabled"
        : "Live mode enabled"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
