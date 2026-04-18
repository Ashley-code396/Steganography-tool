# Steganography Tool — local server UI

This repository contains a small web UI and server for embedding and extracting text messages in images using least-significant-bit (LSB) steganography. It's intended as an educational/demo tool — lightweight and easy to run locally.

## What is steganography?

Steganography is the practice of hiding a message inside another medium so that the existence of the message is concealed. In digital images one of the simplest and most common techniques is LSB steganography: you alter the least significant bit of pixel color channel bytes (for example the lowest bit in the red, green, or blue channels). Because those bits only change pixel values by ±1, visual changes are generally imperceptible for typical photographs.

Key points:
- LSB substitution is not encryption — it only hides the presence of a message. Anyone who knows the method (or inspects LSBs) can read the hidden bits. To protect confidentiality, encrypt the message before embedding.
- Lossy image processing (e.g., JPEG recompression, resizing) can destroy LSB data. Prefer lossless formats (PNG) for embedding.
- Capacity depends on the image dimensions and number of channels: one bit per channel byte is available in this implementation.

## How this tool implements LSB steganography

The embedding/extraction logic lives in `stego/lsb.js`.

- The module converts the message text to a binary string (8 bits per ASCII/UTF-8 code unit) and appends a 16-bit delimiter (`1111111111111110`) so extraction knows where the hidden message ends.
- Embedding replaces the least-significant bit of each color-channel byte with one bit of the message (LSB substitution). The code reads image pixels using `sharp(...).raw().toBuffer()` so it operates on raw bytes, then writes a new image using `sharp(rawBuffer, { raw: ... }).toFile(outputPath)`.
- Extraction reads the LSBs of every byte, concatenates them into a binary stream, splits at the delimiter, and converts the remaining bits back into text.

Important implementation details:
- DELIMITER: `1111111111111110` (16 bits). The delimiter is appended to message bits during embed and used to stop extraction.
- Output format: the server writes the stego output as a PNG file (see `server.js` which names outputs like `originalname-stego.png`). PNG is lossless and preserves LSB changes.

Capacity formula
- If an image has width W, height H and C channels (e.g., 3 for RGB, 4 for RGBA), the number of available bits is W * H * C. The number of storable bytes (roughly) is:

  bytes_available = floor((W * H * C - delimiter_bits) / 8)

  where delimiter_bits = 16 in this implementation.

Example: a 1024 × 768 RGB image (C=3) has 1024*768*3 = 2,359,296 bits ≈ 294,912 bytes of capacity (minus the delimiter).

## Files in this repository
- `server.js` — Express server exposing two endpoints (`/encode`, `/decode`) and serving the web UI from `public/`. Uploaded files are stored temporarily in `tmp/` and cleaned up after processing.
- `stego/lsb.js` — Embedding and extraction utilities using `sharp` and raw pixel buffers.
- `public/` — Simple browser UI (`index.html`, `app.js`, `styles.css`) that lets you choose an image, enter a message to embed, and download the resulting stego image; it also provides an interface to decode a stego image.
- `tmp/` — runtime-only directory (created automatically) where multer stores uploaded files. Files are removed after the server finishes processing requests.

## Usage

1. Install dependencies and start the server:

```bash
cd /home/ashley/projects/steganography-tool
npm install
npm start
```

2. Open the UI in your browser:

  http://localhost:3000

3. Encode with the web UI: choose an image (preferably PNG), type your message, and press Encode. A download link for the stego image will appear.

4. Decode with the web UI: choose a stego image and press Decode to see the hidden message.

### API (server-side) examples

You can call the endpoints directly (multipart form uploads). Example using `curl`:

Encode (embed message and save output as `out.png`):

```bash
curl -s -X POST -F "image=@input.png" -F "message=Hello secret" http://localhost:3000/encode -o out.png
```

Decode (returns JSON `{ message: "..." }`):

```bash
curl -s -X POST -F "image=@out.png" http://localhost:3000/decode
```

## Limitations and security notes

- Not encrypted: The message is plain text. If you need confidentiality, encrypt the message (e.g., AES) before embedding and store/communicate the key out-of-band.
- Avoid lossy transforms: Re-saving a stego PNG as a JPEG (or any recompression/resizing) may destroy hidden bits. Keep images in lossless formats while embedding/extracting.
- Detectability: Simple statistical or visual analysis (steganalysis) can sometimes detect LSB embedding in large payloads. For stronger stealth, consider spreading bits or using more advanced transforms.
- Robustness: This implementation appends a fixed delimiter to mark the end of the message. If you change the delimiter, both embed and extract must be updated.

## Potential improvements
- Add optional message encryption before embedding.
- Add capacity estimation in the UI (show how many bytes can be embedded for the chosen image).
- Support embedding into specific channels or using multi-bit embedding per channel (careful: increases visibility and fragility).
- Add tests and more graceful error handling for very-large messages.

## Troubleshooting
- If `sharp` installation fails: ensure libvips and build tools are available on your system. On most Linux distributions, `sharp` will fetch prebuilt binaries; if not, installing `libvips` via your package manager helps.
- If you get `ENOSPC`, ensure the `tmp/` directory has space or permissions. The server creates `tmp/` at runtime.

## Dependencies
- Node (tested on Node 16+)
- npm
- Packages used: `express`, `multer`, `sharp` (see `package.json`).

## Quick summary

This repo demonstrates a minimal LSB steganography tool with a browser UI and a small API. It's great for learning how bits can be hidden in pixel data. Remember: LSB hiding conceals existence but does not protect content by itself — combine it with encryption if confidentiality matters.

If you'd like, I can:
- add a capacity estimator to the UI,
- add optional AES encryption before embed,
- or add a CLI wrapper to embed/extract from the command-line.

--
Project: Steganography-tool

