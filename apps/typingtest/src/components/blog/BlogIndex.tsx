import Link from "next/link";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@vedicneev/ui";

import type { BlogListItem } from "@/lib/blog/queries";

const DATE_LOCALE: Record<"en" | "hi", string> = { en: "en-IN", hi: "hi-IN" };

const COPY = {
  en: {
    title: "The VedicNeev Typing Blog",
    subtitle: "Exam-specific typing guides — patterns, speed targets, and layout tips for RRB NTPC, High Court, and UPSSSC skill tests.",
    empty: "No posts published yet — check back soon.",
  },
  hi: {
    title: "वेदिकनींव टंकण ब्लॉग",
    subtitle: "परीक्षा-विशिष्ट टंकण गाइड — आरआरबी एनटीपीसी, हाई कोर्ट, और यूपीएसएसएससी कौशल परीक्षणों के लिए पैटर्न, गति लक्ष्य, और लेआउट सुझाव।",
    empty: "अभी तक कोई पोस्ट प्रकाशित नहीं हुई — जल्द ही वापस देखें।",
  },
};

export function BlogIndex({ posts, lang }: { posts: BlogListItem[]; lang: "en" | "hi" }) {
  const copy = COPY[lang];
  const blogPrefix = lang === "hi" ? "/hi/blog" : "/blog";

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12 md:px-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">{copy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">{copy.subtitle}</p>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          {copy.empty}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`${blogPrefix}/${post.slug}`} className="block h-full">
              <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
                <CardHeader>
                  <Badge variant="outline" className="w-fit text-[10px]">
                    {post.category}
                  </Badge>
                  <CardTitle className="text-base leading-snug">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
                  {post.publishedAt ? (
                    <p className="mt-3 text-xs text-muted-foreground">
                      {post.publishedAt.toLocaleDateString(DATE_LOCALE[lang], { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
