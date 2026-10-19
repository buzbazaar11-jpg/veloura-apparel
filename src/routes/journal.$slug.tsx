import { createFileRoute, notFound } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { articles, campaignImages } from "@/lib/veloura-data";
import { useBlogPost } from "@/lib/api";
import { assetUrl } from "@/lib/live-catalog";

export const Route = createFileRoute("/journal/$slug")({
  loader: ({ params }) => {
    const article = articles.find((entry) => entry.slug === params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Story — VELOURA APPAREL Journal" }, { name: "description", content: "Fashion stories from the VELOURA APPAREL journal." }, { property: "og:title", content: "Story — VELOURA APPAREL Journal" }, { property: "og:description", content: "Fashion stories from the VELOURA APPAREL journal." }, { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary_large_image" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${loaderData.article.title} — The VEL0URA APPAREL Journal` },
        { name: "description", content: loaderData.article.description },
        { property: "og:title", content: `${loaderData.article.title} — The VEL0URA APPAREL Journal` },
        { property: "og:description", content: loaderData.article.description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ArticleRoute,
  notFoundComponent: ArticleNotFound,
});

function ArticleRoute() {
  const { article } = Route.useLoaderData();
  const { data: liveData } = useBlogPost(article.slug);
  const post = liveData?.post
    ? {
        ...article,
        title: liveData.post.title,
        description: liveData.post.excerpt ?? article.description,
        image: liveData.post.image_url ? assetUrl(liveData.post.image_url) : article.image,
      }
    : article;
  return (
    <main className="mx-auto max-w-4xl px-5 pb-20 pt-32 sm:px-8">
      <p className="editorial-label">{post.category}</p>
      <h1 className="mt-4 font-display text-5xl leading-none sm:text-7xl">{post.title}</h1>
      <p className="mt-6 text-lg leading-8 text-muted-foreground">{post.description}</p>
      <img
        src={post.image}
        alt={post.title}
        width={1600}
        height={1000}
        loading="lazy"
        className="mt-10 min-h-[420px] w-full rounded-sm object-cover"
      />
      <div className="mt-10 space-y-6 text-base leading-8 text-muted-foreground">
        <p>
          At VEL0URA APPAREL, an oversized jacket is less about volume and more about intent. The shoulder sets the line, the
          body keeps it easy, and everything underneath stays quiet. Begin with one structured piece and let the rest
          of the outfit follow its rhythm.
        </p>
        <p>
          Proportion is the quiet tool of modern dressing. A relaxed jacket asks for a clean tee and a trouser with a
          considered drape. Tone-on-tone palettes — ivory, stone, sage, black — keep the silhouette legible and the
          look deliberate without ever feeling styled.
        </p>
        <p>
          Finally, wear it often. VEL0URA APPAREL essentials are designed for repetition: fabrics that hold their shape,
          hardware that stays restrained, and details that read better the more the piece becomes yours.
        </p>
      </div>
      <Button asChild variant="outline" className="mt-10">
        <Link to="/journal">Back to the journal</Link>
      </Button>
    </main>
  );
}

function ArticleNotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-5 text-center">
      <div>
        <h1 className="font-display text-5xl">This story has moved</h1>
        <Button asChild variant="editorial" className="mt-6">
          <Link to="/journal">Back to the journal</Link>
        </Button>
      </div>
    </main>
  );
}
