import type { Metadata } from "next";

import { BlogIndex } from "@/components/blog/BlogIndex";
import { getPublishedPosts } from "@/lib/blog/queries";

export const revalidate = 3600;

const title = "टंकण परीक्षा ब्लॉग — आरआरबी एनटीपीसी, हाई कोर्ट, यूपीएसएसएससी गाइड";
const description =
  "परीक्षा-विशिष्ट सरकारी टंकण परीक्षण गाइड — आरआरबी एनटीपीसी, हाई कोर्ट आरओ/एआरओ, और यूपीएसएसएससी कौशल परीक्षणों के लिए पैटर्न, गति लक्ष्य, और इंस्क्रिप्ट/रेमिंगटन लेआउट सुझाव।";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/hi/blog", languages: { en: "/blog", hi: "/hi/blog" } },
  openGraph: { title, description, url: "/hi/blog" },
};

export default async function BlogIndexPageHindi() {
  const posts = await getPublishedPosts("hi");
  return <BlogIndex posts={posts} lang="hi" />;
}
