require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const enquiryRoutes = require("./routes/enquiry");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    service: "name-enquiry-api",
    status: "running",
    description:
      "Mock Name Enquiry service simulating account-name lookup for UEMOA mobile money / bank transfers.",
  });
});

app.use("/api", enquiryRoutes);

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error." });
});

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    app.listen(PORT, () => {
      console.log(`name-enquiry-api running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
}

start();
