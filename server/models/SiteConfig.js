const mongoose = require("mongoose");

const siteConfigSchema = new mongoose.Schema(
  {
    maintenanceMode: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteConfig", siteConfigSchema);
