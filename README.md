# Steganography Tool — local server UI

This adds a minimal web UI to upload an image, hide text using least-significant-bit steganography, and decode text from an image.

How to run

1. Install dependencies:

```bash
cd /home/ashley/projects/steganography-tool
npm install
```

2. Start the server:

```bash
npm start
```

3. Open http://localhost:3000 in your browser. Use the "Encode" form to upload an image and a message; you'll receive a downloadable stego image. Use the "Decode" form to upload a stego image and see the hidden message.

Notes

- This server uses `stego/lsb.js` for embedding and extraction and `sharp` for image handling. Uploaded files are placed in `tmp/` temporarily and removed after processing.
- If you'd like to integrate this UI into an existing system (Electron, desktop app, or a different backend), the endpoints are:
  - POST /encode (multipart form with `image` file and `message` field) -> returns stego image file
  - POST /decode (multipart form with `image` file) -> returns JSON { message }
