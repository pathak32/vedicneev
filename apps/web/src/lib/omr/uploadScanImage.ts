import { randomUUID } from "crypto";
import { createSupabaseAdminClient } from "@vedicneev/auth";

const BUCKET = process.env.SUPABASE_OMR_SCANS_BUCKET || "omr-uploads";
// A scanned sheet can carry a student's handwriting/name — kept in a
// PRIVATE bucket (never getPublicUrl) with a signed, time-limited URL,
// same convention as apps/omrtest/src/lib/omr/uploadStorage.ts.
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type UploadScanImageResult = { ok: true; imageUrl: string } | { ok: false; error: string };

/**
 * Stores one buyer's uploaded sample-book scan. Same known limitation as
 * uploadOmrImage.ts's identical tradeoff: the signed URL expires after
 * SIGNED_URL_TTL_SECONDS and is stored as-is in OmrScanAttempt.imageUrl, so
 * the link goes dead after 7 days — acceptable here for the same reason:
 * no "review this scan" UI exists yet to need a fresher one.
 */
export async function uploadScanImage(params: {
  userId: string;
  productId: string;
  buffer: Buffer;
  contentType: string;
  fileExtension: string;
}): Promise<UploadScanImageResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY is not configured — image storage is unavailable." };
  }

  const path = `${params.userId}/${params.productId}/${randomUUID()}.${params.fileExtension}`;

  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, params.buffer, {
    contentType: params.contentType,
    upsert: false,
  });
  if (uploadError) {
    return { ok: false, error: `Could not store the uploaded image: ${uploadError.message}` };
  }

  const { data, error: signError } = await admin.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (signError || !data) {
    return { ok: false, error: `Could not generate an access URL for the uploaded image: ${signError?.message ?? "unknown error"}` };
  }

  return { ok: true, imageUrl: data.signedUrl };
}
