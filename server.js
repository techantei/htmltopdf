// server.js
const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: "10mb" }));

app.post("/generate", async (req, res) => {
  const { html, filename = "document.pdf" } = req.body;
  if (!html) return res.status(400).json({ error: "Missing 'html' in request body." });

  try {
    const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    // You can upload this buffer to storage (e.g., S3, R2, or Xano) here

    // For now, just return the base64 string (frontend can handle it)
    res.json({
      filename,
      base64: pdfBuffer.toString("base64"),
      mimeType: "application/pdf"
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: "Failed to generate PDF." });
  }
});

app.get("/health", (req, res) => {
  res.send("PDF generator is running.");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// To deploy on Render:
// 1. Create a new Web Service
// 2. Set build command to: npm install
// 3. Set start command to: node server.js
// 4. Use Node version 18+
