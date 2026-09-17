import { randomUUID } from "crypto";
import { createSupabaseAdminClient } from "@vedicneev/auth";

const BUCKET = process.env.SUPABASE_OMR_UPLOADS_BUCKET || "omr-uploads";
// A scanned sheet can contain a student's name — kept in a PRIVATE bucket
// (never getPublicUrl) with a signed, time-limited access URL rather than
// a permanently public one.
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type UploadOmrImageResult = { ok: true; imageUrl: string } | { ok: false; error: string };

/**
 * Stores one uploaded sheet photo in Supabase Storage via the existing
 * service-role admin client (@vedicneev/auth's createSupabaseAdminClient —
 * previously only used to bridge a WhatsApp OTP into a Supabase session;
 * this is its second real use). Returns a signed URL, not a public one.
 *
 * Known limitation, documented rather than silently accepted: the signed
 * URL expires after SIGNED_URL_TTL_SECONDS and is stored as-is in
 * OmrUpload.imageUrl, so that link goes dead after 7 days. A production
 * "review this scan" UI should store the storage PATH instead and mint a
 * fresh signed URL per view — building that UI is out of scope here (no
 * such review page exists yet), so this stays a known gap rather than a
 * half-built re-signing route nothing calls yet.
 */
export async function uploadOmrImage(params: {
  instituteId: string;
  testBatchId: string;
  buffer: Buffer;
  contentType: string;
  fileExtension: string;
}): Promise<UploadOmrImageResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY is not configured — image storage is unavailable." };
  }

  const path = `${params.instituteId}/${params.testBatchId}/${randomUUID()}.${params.fileExtension}`;

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
