require("dotenv").config();
const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");


const app = express();
app.use(cors());
app.use(cors({ origin: "https://your-app.vercel.app" })); 
app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));  // Serve uploaded images

const PORT = process.env.PORT || 5000;

// In-memory storage for images (can be replaced with DB or cloud storage)
const upload = multer({ dest: "uploads/" });

// API to get the base layout
app.get("/getEmailLayout", (req, res) => {
    const layoutPath = path.join(__dirname, "layout.html");
    fs.readFile(layoutPath, "utf8", (err, data) => {
        if (err) return res.status(500).send("Error reading layout file.");
        res.send(data);
    });
});

// API to upload an image
app.post("/uploadImage", upload.single("image"), (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).send("No file uploaded.");
    res.send({ url: `/uploads/${file.filename}` });
});

// API to save email configuration (Currently just logs to console)
app.post("/uploadEmailConfig", (req, res) => {
    const emailConfig = req.body;
    if (!emailConfig) return res.status(400).send("Invalid configuration.");
    // Save the configuration to a database or file
    console.log("Email configuration saved:", emailConfig);
    res.send({ message: "Configuration saved successfully!" });
});

// API to render and download the email template
app.post("/renderAndDownloadTemplate", (req, res) => {
    const { layout, config } = req.body;
    if (!layout || !config) return res.status(400).send("Invalid input.");

    // Replace placeholders in layout with config values
    let renderedHTML = layout;
    Object.keys(config).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        renderedHTML = renderedHTML.replace(regex, config[key]);
    });

    // Send the rendered HTML
    res.send({ renderedHTML });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
