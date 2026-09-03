import type { Metadata } from "next";

// The whole /admin tree is gated by middleware.ts (a signed session cookie)
// and should never rank — noindex regardless of auth state.
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
