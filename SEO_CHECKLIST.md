# SEO Checklist — Vedic Neev

Companion to the metadata work in `apps/web`. Two parts: what shipped in
code (§1), and what needs doing in Google Search Console / at the hosting
level, which no code change can do for you (§2).

## 1. What shipped

| Area | Before | After |
|---|---|---|
| Page titles/descriptions | Every route (including `/dashboard`, `/exam/[examId]`, results, OMR) silently inherited the one root `<title>`/description — every page was a duplicate | Every public page has its own title/description; a root title template (`%s \| Vedic Neev`) keeps them consistent |
| OpenGraph / Twitter cards | None beyond a bare title/description | Full `openGraph`/`twitter` blocks + a generated 1200×630 default image (`app/opengraph-image.tsx`) |
| Favicon | None (`public/` was empty) | `app/icon.svg`, auto-wired by Next |
| robots.txt | Didn't exist | `app/robots.ts` — allows everything except `/api/*`, points at the sitemap |
| sitemap.xml | Didn't exist | `app/sitemap.ts` — lists only `/`, `/pricing`, `/learn` |
| Private/account pages (`/dashboard`, `/parent`, `/onboarding`, `/exam/**`) | Indexable by default (no robots directive at all) | `robots: { index: false, follow: true }` |
| `/exam/[examId]/results` for an unrecognized `examId` | Rendered a generic "no submitted attempt found" message with **HTTP 200**, for literally any string — a soft 404 across an unbounded URL space | Real `notFound()` (HTTP 404), validated once in `app/exam/[examId]/layout.tsx` for the whole subtree (player, results, both OMR routes) |
| 404 page | Next's bare default | Branded, with links back to `/`, `/pricing`, `/learn` |
| Structured data | None | `Organization` + `WebSite` (site-wide, root layout) and `Product`/`Offer` per plan (`/pricing`) |

Canonical source for the domain: `apps/web/src/lib/siteConfig.ts` (`SITE_URL`,
`SITE_NAME`) — `metadataBase`, `robots.ts`, and `sitemap.ts` all read from it,
so they can't drift out of sync with each other.

**Deliberate choice — noindex, not `robots.txt Disallow`, for private
pages.** Blocking `/dashboard`, `/parent`, `/onboarding`, `/exam/**` in
`robots.txt` would stop Googlebot from ever crawling them to see a noindex
tag — Google can still index a bare URL it's never allowed to fetch, based
purely on links pointing at it, with no title or snippet. That's exactly
the "Indexed, though blocked by robots.txt" Search Console warning. Using
`noindex` (crawlable, not shown in results) is Google's own recommended
fix for this pattern.

## 2. Search Console checklist

Work through this **after** the code above is deployed to the domain
Search Console is verified against.

### One-time setup
- [ ] Confirm which origin is canonical — `vedicneev.com` or the Vercel
      default (`vedicneev-web.vercel.app`, per the repo's current GitHub
      `homepage` field). If the custom domain isn't connected yet, either
      connect it or set `NEXT_PUBLIC_APP_URL` to whichever origin actually
      serves production traffic — every generated URL (canonical, OG,
      sitemap, robots) is wrong until this matches reality.
- [ ] Verify ownership of that exact origin in Search Console (DNS TXT
      record or HTML file, per Google's instructions) — verifying the
      wrong origin (e.g. `www.` when you serve bare, or vice versa) is a
      common reason people think Search Console "isn't picking anything up."
- [ ] Set the **preferred domain** at the DNS/hosting level: pick `www.` or
      bare, and 301-redirect the other to it. Two versions serving the same
      content with no redirect is a duplicate-content source Search Console
      will flag as "Duplicate without user-selected canonical."
- [ ] Submit `https://vedicneev.com/sitemap.xml` under Search Console →
      Sitemaps.

### Fixing existing Soft 404s
- [ ] Search Console → Pages → find "Soft 404" in the list of reasons
      pages aren't indexed, and open it to see the affected URLs. Before
      this deploy, expect `/exam/*/results` (any examId, including ones
      that were never real) and possibly `/dashboard`, `/parent`,
      `/onboarding` in that list.
- [ ] Spot-check a few of those URLs with the **URL Inspection tool** —
      "Test Live URL" — and confirm they now either 404 for real (bad
      examId) or carry a `noindex` tag (account pages). Both are valid,
      different fixes for what Search Console lumps together as "soft 404."
- [ ] For each URL (or pattern) that's now fixed, click **Validate Fix**
      in the Soft 404 report. This doesn't happen automatically — Google
      won't re-check on its own timeline without it.
- [ ] Expect validation to take days, not minutes. Re-check in ~1–2 weeks;
      Search Console will show "Validation in progress" until it's done.

### Ongoing hygiene
- [ ] Search Console → Pages → **Indexing** report, monthly: watch for new
      "Excluded" reasons appearing (e.g. "Discovered — currently not
      indexed," "Crawled — currently not indexed"). A rising count on a
      real content page (not `/dashboard`/`/exam/**`, which are *supposed*
      to be excluded) usually means thin or slow-loading content, not a
      technical block.
- [ ] Search Console → **Core Web Vitals** report: `/`, `/pricing`, `/learn`
      are the pages that matter for ranking — the app routes are noindex
      and excluded from CWV scoring regardless of their performance.
- [ ] Whenever a new genuinely public page is added (not account- or
      session-specific), add it to `apps/web/app/sitemap.ts` — it will not
      be picked up automatically.
- [ ] Whenever `NEXT_PUBLIC_APP_URL` or the canonical domain changes,
      re-verify robots.txt/sitemap.xml are pointing at the new origin
      before resubmitting in Search Console.
- [ ] **Rich results**: after the Product/Offer JSON-LD on `/pricing` has
      been live a few days, check Search Console → Enhancements for a
      "Merchant listings" or "Products" report and fix any warnings it
      surfaces (Google is stricter about required Product fields —
      `image`, `sku`, `review`/`aggregateRating` — than the bare minimum
      shipped here; add them if you want full rich-result eligibility
      rather than just structured-data validity).
- [ ] If/when a real payment gateway or new plans replace the current
      Razorpay mock, double check `PLAN_CONFIG` (`packages/engine/src/entitlements.ts`)
      still drives the `/pricing` JSON-LD correctly — it's generated from
      that config, not hand-maintained, so it should track automatically,
      but verify after any pricing-model change.
