import type { Metadata } from "next";

// Account-specific guardian dashboard — never meant to rank. noindex (not a
// robots.txt disallow) so Googlebot can still crawl it, see this tag, and
// correctly drop it rather than indexing a bare URL with no snippet.
export const metadata: Metadata = {
  title: "Parent Command Center",
  robots: { index: false, follow: true },
};

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
