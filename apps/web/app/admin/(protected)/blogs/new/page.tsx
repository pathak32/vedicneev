import { BlogEditForm } from "@/components/admin/BlogEditForm";

export default function NewBlogPostPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-16">
      <h1 className="text-2xl font-bold text-foreground">New Post</h1>
      <BlogEditForm mode="create" />
    </div>
  );
}
