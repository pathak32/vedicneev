import sharp from "sharp";
import { toGrayscale, type GrayscaleImage } from "@vedicneev/engine";

/**
 * Decodes an uploaded photo into the GrayscaleImage shape
 * packages/engine/src/omrScan.ts's pixel-math (detectFiducialCorners,
 * sampleBubbleFillRatio, decodeDigitGrid) already operates on — the exact
 * same functions apps/web's browser-side OmrScanner.tsx uses via
 * <canvas>.getImageData, just fed from `sharp`'s raw pixel buffer instead
 * (Node has no DOM canvas). `.rotate()` with no argument auto-orients from
 * the image's EXIF tag, which matters here specifically: a phone photo is
 * very often stored "sideways" with an EXIF rotation flag rather than
 * physically rotated pixels, and skipping this would feed
 * detectFiducialCorners a sheet that's actually rotated 90°, which its
 * quadrant-based corner search has no way to recover from.
 */
export async function decodeImageToGrayscale(buffer: Buffer): Promise<GrayscaleImage> {
  const { data, info } = await sharp(buffer).rotate().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return toGrayscale(new Uint8ClampedArray(data.buffer, data.byteOffset, data.length), info.width, info.height);
}

/**
 * A lightweight average-hash (aHash), not a cryptographic hash — the point
 * (per OmrUpload.imageHash's own schema comment) is that a rescanned or
 * re-photographed copy of the SAME physical sheet still collides, which an
 * exact byte/SHA hash would never do (JPEG re-encoding, a slightly
 * different crop, or a second photo taken seconds later all change the
 * exact bytes but not the visual content). Standard technique: downscale
 * to a tiny fixed grid, threshold each pixel against the grid's own mean
 * brightness, and pack the result into a hex bitstring — two images that
 * look alike produce the same (or a very close) hash regardless of source
 * resolution/compression.
 */
const HASH_GRID_SIZE = 16;

export async function computeAverageImageHash(buffer: Buffer): Promise<string> {
  const { data } = await sharp(buffer)
    .rotate()
    .resize(HASH_GRID_SIZE, HASH_GRID_SIZE, { fit: "fill" })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixelCount = HASH_GRID_SIZE * HASH_GRID_SIZE;
  let sum = 0;
  for (let i = 0; i < pixelCount; i++) sum += data[i]!;
  const mean = sum / pixelCount;

  let bits = "";
  for (let i = 0; i < pixelCount; i++) bits += data[i]! >= mean ? "1" : "0";

  // Pack the 256-bit string into hex (64 chars) for compact storage.
  let hex = "";
  for (let i = 0; i < bits.length; i += 4) {
    hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  }
  return hex;
}
