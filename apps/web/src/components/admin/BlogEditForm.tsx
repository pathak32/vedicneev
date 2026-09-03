"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@vedicneev/ui";

import { BLOG_CATEGORIES } from "@/lib/blog/categories";
import { slugify } from "@/lib/blog/slugify";

export interface BlogEditFormValues {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
}

export interface BlogEditFormProps {
  mode: "create" | "edit";
  postId?: string;
  initialValues?: BlogEditFormValues;
}

const EMPTY_VALUES: BlogEditFormValues = { title: "", slug: "", category: BLOG_CATEGORIES[0], excerpt: "", content: "" };

export function BlogEditForm({ mode, postId, initialValues }: BlogEditFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<BlogEditFormValues>(initialValues ?? EMPTY_VALUES);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof BlogEditFormValues>(key: K, value: BlogEditFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleTitleChange(title: string) {
    update("title", title);
    if (!slugTouched) update("slug", slugify(title));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const url = mode === "create" ? "/api/admin/blogs" : `/api/admin/blogs/${postId}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save the post.");
        return;
      }
      router.push(mode === "create" ? `/admin/blogs/${data.post.id}/edit` : "/admin/blogs");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="blog-title" className="text-sm font-medium text-foreground">
          Title
        </label>
        <input
          id="blog-title"
          value={values.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-base"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="blog-slug" className="text-sm font-medium text-foreground">
          Slug
        </label>
        <input
          id="blog-slug"
          value={values.slug}
          onChange={(e) => {
            setSlugTouched(true);
            update("slug", e.target.value);
          }}
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          className="h-10 w-full rounded-md border border-input bg-background px-3 font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">Public URL: /blog/{values.slug || "…"}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="blog-category" className="text-sm font-medium text-foreground">
          Category
        </label>
        <input
          id="blog-category"
          list="blog-category-options"
          value={values.category}
          onChange={(e) => update("category", e.target.value)}
          required
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-base"
        />
        <datalist id="blog-category-options">
          {BLOG_CATEGORIES.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="blog-excerpt" className="text-sm font-medium text-foreground">
          Excerpt <span className="font-normal text-muted-foreground">— also used as the meta description</span>
        </label>
        <textarea
          id="blog-excerpt"
          value={values.excerpt}
          onChange={(e) => update("excerpt", e.target.value)}
          required
          rows={2}
          maxLength={200}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <p className="text-right text-xs text-muted-foreground">{values.excerpt.length}/200</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="blog-content" className="text-sm font-medium text-foreground">
          Content <span className="font-normal text-muted-foreground">— Markdown</span>
        </label>
        <textarea
          id="blog-content"
          value={values.content}
          onChange={(e) => update("content", e.target.value)}
          required
          rows={20}
          className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : mode === "create" ? "Create Draft" : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/blogs")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
