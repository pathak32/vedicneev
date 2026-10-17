/**
 * Sender for LinkedIn's official UGC Posts API (v2/ugcPosts) — the
 * fetch-and-auth counterpart to composePost.ts's pure text formatter.
 * Reads LINKEDIN_ACCESS_TOKEN/LINKEDIN_AUTHOR_URN at call time rather than
 * module load, same convention as whatsappService.ts, so a missing config
 * fails the individual publish action, not the whole route.
 */

const LINKEDIN_API_VERSION = "202401";

export interface PublishLinkedInPostResult {
  success: boolean;
  postUrn: string | null;
  error?: string;
  /** True when an image was requested but the post went out as plain text instead. */
  imageSkipped?: boolean;
}

export interface PostImage {
  bytes: Uint8Array;
  altText: string;
}

function authHeaders(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "X-Restli-Protocol-Version": "2.0.0",
    "LinkedIn-Version": LINKEDIN_API_VERSION,
  };
}

/**
 * Uploads an image through LinkedIn's register-upload flow and returns the
 * asset URN to attach to a post, or null if any step fails. Never throws:
 * the caller falls back to a text-only post.
 */
async function uploadImage(accessToken: string, authorUrn: string, bytes: Uint8Array): Promise<string | null> {
  try {
    const register = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
          owner: authorUrn,
          serviceRelationships: [{ relationshipType: "OWNER", identifier: "urn:li:userGeneratedContent" }],
        },
      }),
    });
    if (!register.ok) return null;

    const registered = await register.json();
    const uploadUrl: string | undefined =
      registered?.value?.uploadMechanism?.["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"]?.uploadUrl;
    const asset: string | undefined = registered?.value?.asset;
    if (!uploadUrl || !asset) return null;

    const upload = await fetch(uploadUrl, {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}` },
      // A Uint8Array is a valid fetch body at runtime; this TS lib version just doesn't list it.
      body: bytes as unknown as BodyInit,
    });
    return upload.ok ? asset : null;
  } catch {
    return null;
  }
}

async function createPost(
  accessToken: string,
  authorUrn: string,
  text: string,
  image: { asset: string; altText: string } | null
): Promise<Response> {
  const shareContent = image
    ? {
        shareCommentary: { text },
        shareMediaCategory: "IMAGE",
        media: [{ status: "READY", description: { text: image.altText }, media: image.asset, title: { text: image.altText } }],
      }
    : { shareCommentary: { text }, shareMediaCategory: "NONE" };

  return fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: { "com.linkedin.ugc.ShareContent": shareContent },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    }),
  });
}

/**
 * Publishes share content as the configured LINKEDIN_AUTHOR_URN (an
 * organization or member URN, e.g. "urn:li:organization:12345678"). With an
 * image, it tries to upload and attach it; if the upload fails, or LinkedIn
 * rejects the image post, the same text goes out as a plain post instead
 * (reported via imageSkipped), so an image problem never costs a post.
 * LinkedIn returns the new post's URN in the `x-restli-id` response header
 * (its documented convention for ugcPosts), with the body normally empty on
 * success — so that header, not the body, is read first.
 */
export async function publishLinkedInPost(text: string, image?: PostImage): Promise<PublishLinkedInPostResult> {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const authorUrn = process.env.LINKEDIN_AUTHOR_URN;

  if (!accessToken || !authorUrn) {
    return { success: false, postUrn: null, error: "LINKEDIN_ACCESS_TOKEN / LINKEDIN_AUTHOR_URN not configured." };
  }

  try {
    let attached: { asset: string; altText: string } | null = null;
    if (image) {
      const asset = await uploadImage(accessToken, authorUrn, image.bytes);
      if (asset) attached = { asset, altText: image.altText };
    }

    let response = await createPost(accessToken, authorUrn, text, attached);
    let imageSkipped = Boolean(image) && !attached;

    // An image post LinkedIn refused created nothing, so retrying as text can't double-post.
    if (!response.ok && attached) {
      response = await createPost(accessToken, authorUrn, text, null);
      imageSkipped = true;
    }

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      return { success: false, postUrn: null, error: data?.message ?? `LinkedIn API error (${response.status}).` };
    }

    return { success: true, postUrn: response.headers.get("x-restli-id"), imageSkipped };
  } catch (error) {
    return {
      success: false,
      postUrn: null,
      error: error instanceof Error ? error.message : "Failed to publish.",
    };
  }
}
