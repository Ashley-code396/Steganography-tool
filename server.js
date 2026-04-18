import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { embed, extract } from "./stego/lsb.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tmpDir = path.join(__dirname, "tmp");
await fs.mkdir(tmpDir, { recursive: true });

const upload = multer({ dest: tmpDir });

const app = express();
app.use(express.static(path.join(__dirname, "public")));

app.post("/encode", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });
    const message = req.body.message || "";
    const inputPath = req.file.path;
    const outputPath = path.join(tmpDir, `${req.file.filename}-stego.png`);

    await embed(inputPath, message, outputPath);

    // use original filename (without extension) and append -stego.png so
    // users won't accidentally overwrite their original file when saving
    const origName = path.parse(req.file.originalname).name;
    const downloadName = `${origName}-stego.png`;

    res.download(outputPath, downloadName, async (err) => {
      await fs.unlink(inputPath).catch(() => {});
      await fs.unlink(outputPath).catch(() => {});
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/decode", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });
    const inputPath = req.file.path;
    const message = await extract(inputPath);
    await fs.unlink(inputPath).catch(() => {});
    res.json({ message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
