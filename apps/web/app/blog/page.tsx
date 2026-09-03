import Link from "next/link";
import { Badge, Card, CardContent, CardHeader, CardTitle, cn } from "@vedicneev/ui";

import { BLOG_CATEGORIES } from "@/lib/blog/categories";
import { getPublishedPosts } from "@/lib/blog/queries";

// New posts are published from /admin without a redeploy — ISR keeps pages
// fast (real Core Web Vitals benefit) while staying reasonably fresh.
export const revalidate = 3600;

export default async function BlogIndexPage({ searchParams }: { searchParams: { category?: string } }) {
  const posts = await getPublishedPosts();
  const activeCategory = searchParams.category;
  const filtered = activeCategory ? posts.filter((p) => p.category === activeCategory) : posts;

  const categoriesWithPosts = BLOG_CATEGORIES.filter((category) => posts.some((p) => p.category === category));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12 md:px-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">The Vedic Neev Blog</h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          Practical guidance on JNVST, AISSEE, and RMS preparation — no hype, no fabricated numbers.
        </p>
      </div>

      {categoriesWithPosts.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/blog"
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              !activeCategory
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/50"
            )}
          >
            All
          </Link>
          {categoriesWithPosts.map((category) => (
            <Link
              key={category}
              href={`/blog?category=${encodeURIComponent(category)}`}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                activeCategory === category
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50"
              )}
            >
              {category}
            </Link>
          ))}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          {posts.length === 0
            ? "No posts published yet — check back soon."
            : "No posts in this category yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="block h-full">
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
                      {post.publishedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
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
