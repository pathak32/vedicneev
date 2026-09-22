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
}

/**
 * Publishes plain-text share content as the configured LINKEDIN_AUTHOR_URN
 * (an organization or member URN, e.g. "urn:li:organization:12345678").
 * LinkedIn returns the new post's URN in the `x-restli-id` response header
 * (its documented convention for ugcPosts), with the response body itself
 * normally empty on success — so that header, not the body, is read first.
 */
export async function publishLinkedInPost(text: string): Promise<PublishLinkedInPostResult> {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const authorUrn = process.env.LINKEDIN_AUTHOR_URN;

  if (!accessToken || !authorUrn) {
    return { success: false, postUrn: null, error: "LINKEDIN_ACCESS_TOKEN / LINKEDIN_AUTHOR_URN not configured." };
  }

  try {
    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
        "LinkedIn-Version": LINKEDIN_API_VERSION,
      },
      body: JSON.stringify({
        author: authorUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text },
            shareMediaCategory: "NONE",
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      return { success: false, postUrn: null, error: data?.message ?? `LinkedIn API error (${response.status}).` };
    }

    const postUrn = response.headers.get("x-restli-id");
    return { success: true, postUrn };
  } catch (error) {
    return {
      success: false,
      postUrn: null,
      error: error instanceof Error ? error.message : "Failed to publish.",
    };
  }
}
