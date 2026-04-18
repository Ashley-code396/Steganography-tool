import sharp from "sharp";

const DELIMITER = "1111111111111110";

function textToBinary(text) {
  return text
    .split("")
    .map(c => c.charCodeAt(0).toString(2).padStart(8, "0"))
    .join("");
}

function binaryToText(binary) {
  let text = "";
  for (let i = 0; i < binary.length; i += 8) {
    text += String.fromCharCode(parseInt(binary.slice(i, i + 8), 2));
  }
  return text;
}

// ---------------- EMBED ----------------
export async function embed(inputPath, message, outputPath) {
  const image = sharp(inputPath);
  const { data, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });

  let binary = textToBinary(message) + DELIMITER;

  let bitIndex = 0;

  for (let i = 0; i < data.length; i++) {
    if (bitIndex < binary.length) {
      data[i] = (data[i] & 254) | parseInt(binary[bitIndex]); // LSB replace
      bitIndex++;
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels
    }
  }).toFile(outputPath);
}

// ---------------- EXTRACT ----------------
export async function extract(imagePath) {
  const { data } = await sharp(imagePath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  let binary = "";

  for (let i = 0; i < data.length; i++) {
    binary += (data[i] & 1).toString();
  }

  binary = binary.split(DELIMITER)[0];

  return binaryToText(binary);
}