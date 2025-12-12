import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Share2 } from "lucide-react";
import { notFound } from "next/navigation";
import blogsService, { BlogPost } from "../../../lib/api/services/blogs";


export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  try {
    const post: BlogPost = await blogsService.getBySlug(slug);
    return {
      title: post.title,
      description: post.excerpt || post.title,
    };
  } catch {
    return {
      title: "Article Not Found",
      description: "The article you are looking for does not exist",
    };
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  let post: BlogPost | null = null;
  try {
    post = await blogsService.getBySlug(slug);
  } catch {
    notFound();
  }
  if (!post) {
    notFound();
  }

  // Related posts logic removed (no category field)
  // Related posts removed

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        {/* Article Header */}
        <article className="space-y-8">
          {/* Title and Meta */}
          <div className="space-y-4">
            {/* Category removed */}
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{post.title}</h1>
            {post.excerpt && <p className="text-xl text-muted-foreground">{post.excerpt}</p>}

            {/* Author, Date, ReadTime removed */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-border/40">
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: post.title,
                      text: post.excerpt || post.title,
                      url: `/blog/${post.slug}`,
                    });
                  }
                }}
                className="ml-auto text-primary hover:underline"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted">
            <Image
              src={post.image || "/placeholder.svg"}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Article Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <div className="space-y-6 text-base leading-relaxed">
              {post.content.split("\n\n").map((paragraph: string, index: number) => {
                if (paragraph.startsWith("##")) {
                  return (
                    <h2 key={index} className="text-2xl font-bold mt-8 mb-4">
                      {paragraph.replace(/^##\s*/, "")}
                    </h2>
                  )
                }
                if (paragraph.startsWith("###")) {
                  return (
                    <h3 key={index} className="text-xl font-semibold mt-6 mb-2">
                      {paragraph.replace(/^###\s*/, "")}
                    </h3>
                  )
                }
                if (paragraph.startsWith("- ")) {
                  return (
                    <ul key={index} className="list-disc list-inside space-y-2 ml-4">
                      {paragraph.split("\n").map((item: string, idx: number) => (
                        <li key={idx} className="text-muted-foreground">
                          {item.replace(/^-\s*/, "")}
                        </li>
                      ))}
                    </ul>
                  )
                }
                return (
                  <p key={index} className="text-muted-foreground">
                    {paragraph}
                  </p>
                )
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border/40 my-12" />

          {/* Author Bio removed */}

          {/* Divider */}
          <div className="border-t border-border/40 my-12" />

          {/* Related Posts removed */}
        </article>
      </div>
    </div>
  )
}
