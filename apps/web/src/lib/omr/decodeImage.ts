import sharp from "sharp";
import { toGrayscale, type GrayscaleImage } from "@vedicneev/engine";

/**
 * Decodes an uploaded sample-book OMR photo into the GrayscaleImage shape
 * packages/engine/src/omrScan.ts's pixel-math already operates on — same
 * technique and same reason as apps/omrtest/src/lib/omr/decodeImage.ts's
 * identical function (duplicated rather than shared across apps, matching
 * this monorepo's existing convention of keeping Node-only image decoding
 * app-local while only the pure pixel-math lives in @vedicneev/engine).
 * `.rotate()` with no argument auto-orients from the image's EXIF tag — a
 * phone photo is very often stored "sideways" with just a rotation flag,
 * and skipping this would feed detectFiducialCorners a sheet rotated 90°
 * with no way to recover.
 */
export async function decodeImageToGrayscale(buffer: Buffer): Promise<GrayscaleImage> {
  const { data, info } = await sharp(buffer).rotate().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return toGrayscale(new Uint8ClampedArray(data.buffer, data.byteOffset, data.length), info.width, info.height);
}
