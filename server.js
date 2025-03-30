// server.js
const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: "10mb" }));

app.post("/generate", async (req, res) => {
  const { html, filename = "document.pdf" } = req.body;
  if (!html) return res.status(400).json({ error: "Missing 'html' in request body." });

  let browser;
  try {
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4" });

    res.json({
      filename,
      base64: pdfBuffer.toString("base64"),
      mimeType: "application/pdf"
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: "Failed to generate PDF." });
  } finally {
    if (browser) await browser.close();
  }
});

app.get("/health", (req, res) => {
  res.send("PDF generator is running.");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
