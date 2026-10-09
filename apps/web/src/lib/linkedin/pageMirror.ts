/**
 * Optional second destination for every LinkedIn post: after a post goes out
 * on the profile, the same text is sent to a Make.com scenario, which holds
 * LinkedIn's own approval to publish to the Vedic Mind AI Company Page. This
 * is how the page gets the posts without this project needing LinkedIn's
 * Community Management API permission.
 *
 * Entirely opt-in and best-effort: with MAKE_LINKEDIN_WEBHOOK_URL unset it
 * does nothing, and a failure here never throws, so it can never block or
 * undo the profile post that already succeeded.
 */

const TIMEOUT_MS = 8000;

export interface PageMirrorResult {
  attempted: boolean;
  ok: boolean;
  error?: string;
}

export async function mirrorToCompanyPage(input: {
  blockId: string;
  text: string;
  // Present only for posts with an image card; Make.com can route on it.
  imageUrl?: string;
}): Promise<PageMirrorResult> {
  const url = process.env.MAKE_LINKEDIN_WEBHOOK_URL;
  if (!url) return { attempted: false, ok: false };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockId: input.blockId, text: input.text, imageUrl: input.imageUrl ?? "" }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return { attempted: true, ok: false, error: `Webhook returned ${response.status}.` };
    return { attempted: true, ok: true };
  } catch (error) {
    return { attempted: true, ok: false, error: error instanceof Error ? error.message : "Webhook call failed." };
  }
}
