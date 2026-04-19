# Steganography Tool 

A small,  demo that shows how to hide text inside images using least-significant-bit (LSB) steganography. The project includes a minimal web UI and  a tiny API

Table of contents
- Quick start
- Visual demo (before → embedding → after)
- How it works (short)
- Implementation details
- Files & where to look
- API examples
- Troubleshooting & notes
- Next steps

---

## Quick start

1. Install dependencies and start the server:

```bash
cd /home/ashley/projects/steganography-tool
npm install
npm start
```

2. Open the UI in your browser:

http://localhost:3000

3. Use the Encode form to embed text into an image and download the stego output. Use the Decode form to extract a hidden message.


---

## Visual demo (before → embedding → after)



<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
  <div style="text-align:center">
    <img src="assets/demo-before.jpg" alt="Before demo" style="width:220px;border:1px solid #ddd;padding:2px;background:#fff" />
    <div style="font-size:12px;margin-top:6px;color:#444">Before (original)</div>
  </div>

  <div style="text-align:center;min-width:220px">
    <div style="font-size:28px;color:#666;line-height:1">→</div>
    <div style="border:1px dashed #bbb;padding:8px;margin-top:6px;border-radius:6px;background:#fafafa">
      <div style="display:flex;align-items:center;gap:8px;justify-content:center">
        <img src="assets/demo-before.jpg" alt="embed-thumb" style="width:70px;border:1px solid #eee" />
        <div style="text-align:left">
          <div style="font-weight:600;color:#222">Embedding</div>
          <div style="font-family:monospace;font-size:13px;color:#111;margin-top:6px">"hidden secret"</div>
          <div style="font-size:12px;color:#666;margin-top:4px">(message embedded into image LSBs)</div>
        </div>
      </div>
    </div>
  </div>

  <div style="text-align:center">
    <div style="font-size:28px;color:#666;line-height:1">→</div>
    <img src="assets/demo-after.png" alt="After demo" style="width:220px;border:1px solid #ddd;padding:2px;background:#fff;margin-top:8px" />
    <div style="font-size:12px;margin-top:6px;color:#444">After (stego output)</div>
  </div>
</div>


---

## How it works (short)

1. Convert message text to a bit stream (8 bits per character).
2. Append a 16-bit delimiter (`1111111111111110`) so the extractor knows when to stop.
3. Replace the least significant bit (LSB) of each image channel byte (R, G, B, ...) with successive message bits.
4. Save the modified raw buffer as a PNG so the LSB changes are preserved.

This yields a stego image that visually matches the original but carries the hidden message in pixel LSBs.

---

## Implementation details

- `stego/lsb.js` contains `embed(inputPath, message, outputPath)` and `extract(imagePath)` implementations. It uses `sharp` to read/write raw pixel buffers.
- The delimiter used is `1111111111111110` (16 bits).
- The embedder writes a PNG output (`...-stego.png` when used via the server) to avoid lossy compression.

Capacity note
- Available bits ≈ `W * H * C` (width × height × channels). Bytes available ≈ `floor((W*H*C - delimiter_bits) / 8)`.

---

## Files & where to look

- `server.js` — Express server with endpoints:
  - `POST /encode` (form fields: `image` file, `message` text) -> returns stego PNG
  - `POST /decode` (form field: `image`) -> returns JSON `{ message }`
- `stego/lsb.js` — embedding/extraction logic (uses `sharp` `.raw()` buffers)
- `public/` — UI: `index.html`, `app.js`, `styles.css`
- `assets/` — demo images (not all tracked by default)

---

## API examples (curl)

Encode (embed and save output to `out.png`):

```bash
curl -s -X POST -F "image=@input.png" -F "message=Hello secret" http://localhost:3000/encode -o out.png
```

Decode (returns JSON `{ message: "..." }`):

```bash
curl -s -X POST -F "image=@out.png" http://localhost:3000/decode
```

---

## Troubleshooting & notes

- sharp installation problems: ensure libvips and build tools are available on your system. On many Linux systems you can install `libvips` via the package manager to avoid building from source.
- Use PNG for embedding when possible. JPEG or other lossy transforms will likely destroy hidden bits.

Security reminder
- LSB steganography hides the existence of a message but does not encrypt it. If confidentiality matters, encrypt the message before embedding (e.g., AES with a separate key).

---

## Next steps (optional improvements)

- Add a capacity estimator to the UI so users know how much text fits before embedding.
- Add optional encryption (client-side or server-side) before embed.
- Add a CLI wrapper for quick command-line encode/decode.


---

Project: Steganography-tool — small LSB demo



