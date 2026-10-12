import { createFileRoute, notFound } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ProductDetailPage } from "@/components/veloura/commerce";
import { getProductBySlug, type Product } from "@/lib/veloura-data";
import { fetchBackendProduct } from "@/lib/live-catalog";
import { apiEnabled } from "@/lib/api";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProductBySlug(params.slug);
    // Always return something — live fetch happens in component
    return { product: product ?? null, slug: params.slug };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.product) {
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
  const { product: staticProduct, slug } = Route.useLoaderData();
  const [liveProduct, setLiveProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!apiEnabled) return;
    fetchBackendProduct(slug).then((p) => {
      if (p) setLiveProduct(p);
    });
  }, [slug]);

  const product = liveProduct ?? staticProduct;

  if (!product) return <ProductNotFound />;
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
