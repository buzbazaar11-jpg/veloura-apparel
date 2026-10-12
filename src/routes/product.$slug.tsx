import { createFileRoute, notFound } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { ProductDetailPage } from "@/components/veloura/commerce";
import { getProductBySlug } from "@/lib/veloura-data";
import { fetchBackendProduct } from "@/lib/live-catalog";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const product = (await fetchBackendProduct(params.slug)) ?? getProductBySlug(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Product — VEL0URA APPAREL" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${loaderData.product.name} — VEL0URA APPAREL` },
        { name: "description", content: loaderData.product.description },
        { property: "og:title", content: `${loaderData.product.name} — VEL0URA APPAREL` },
        { property: "og:description", content: loaderData.product.description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductRoute,
  notFoundComponent: ProductNotFound,
});

function ProductRoute() {
  const { product } = Route.useLoaderData();
  return <ProductDetailPage product={product} />;
}

function ProductNotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-5 text-center">
      <div>
        <h1 className="font-display text-5xl">This piece is no longer available</h1>
        <Button className="mt-6" asChild variant="editorial">
          <Link to="/shop">Back to the shop</Link>
        </Button>
      </div>
    </main>
  );
}

