import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useVelouraStore } from '@/lib/veloura-store';
import { formatPrice, productPrice, type Product } from '@/lib/veloura-data';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiEnabled, useReviews } from '@/lib/api';

export function Price({ product }: { product: Product }) {
 return <span className="flex flex-wrap items-center gap-2 text-sm font-semibold"><span>{formatPrice(productPrice(product))}</span>{product.salePrice ? <><del className="font-normal text-muted-foreground">{formatPrice(product.price)}</del><span className="text-xs text-sage">−{Math.round((1-product.salePrice/product.price)*100)}%</span></> : null}</span>;
}

// ─── useProductRating ────────────────────────────────────────────────────────
export function useProductRating(productId: string, fallback: number) {
  const { data } = useReviews(productId);
  const filtered = data?.reviews?.filter(r => r.product_id === productId) ?? [];
  return filtered.length ? filtered.reduce((s, r) => s + r.rating, 0) / filtered.length : fallback;
}

export function Rating({ product }: { product: Product }) {
  const { data } = useReviews(product.id);
  const filtered = data?.reviews?.filter(r => r.product_id === product.id) ?? [];
  const liveRating = filtered.length
    ? filtered.reduce((s, r) => s + r.rating, 0) / filtered.length
    : 0;
  const liveCount = filtered.length;

  const displayRating = liveRating > 0 ? liveRating.toFixed(1) : product.rating;
  const displayLabel = apiEnabled && liveCount > 0
    ? `(${liveCount} reviews)`
    : `(${product.reviewCount} demo reviews)`;

  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Star className="size-3 fill-current text-sage" />
      {displayRating} <span>{displayLabel}</span>
    </span>
  );
}
export function CouponInput() {
 const { coupon, discount, applyCoupon, removeCoupon } = useVelouraStore();
 const [code,setCode]=useState(''); const [error,setError]=useState('');
 return <div className="my-4"><label htmlFor="coupon-code" className="text-xs font-semibold uppercase">Coupon code</label>{coupon ? <div className="mt-2 flex items-center justify-between gap-2"><span className="text-sm text-sage">✓ {coupon} · Saved {formatPrice(discount)}</span><Button type="button" variant="ghost" size="icon" aria-label="Remove coupon" onClick={removeCoupon}><X /></Button></div> : <><div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] gap-2"><input id="coupon-code" value={code} onChange={e=>setCode(e.target.value)} placeholder="Enter coupon code" className="min-w-0 rounded-sm border border-input bg-background px-3 py-2 text-sm" /><Button type="button" variant="outline" size="sm" onClick={()=>{ void applyCoupon(code).then(ok => setError(ok ? '' : 'Invalid or expired coupon.')); }}>Apply</Button></div>{error ? <p role="alert" className="mt-2 text-xs text-destructive">{error}</p> : null}</>}</div>;
}
export function QuickAdd({ product, onClose }: { product: Product; onClose: () => void }) {
 const {addToCart}=useVelouraStore(); const [size,setSize]=useState(product.sizes.length===1 ? product.sizes[0] ?? '' : ''); const [color,setColor]=useState(product.colors[0] ?? ''); const [quantity,setQuantity]=useState(1);const [error,setError]=useState('');
 return <Dialog open onOpenChange={open=>{if(!open)onClose();}}><DialogContent className="max-h-[90svh] w-[calc(100%-2rem)] overflow-y-auto"><DialogTitle className="font-display text-3xl">Quick Add</DialogTitle><DialogDescription>{product.name}</DialogDescription><div className="grid grid-cols-[100px_minmax(0,1fr)] gap-4"><img src={product.images[0]} width={200} height={250} alt={product.name} className="aspect-[4/5] w-full object-cover" /><div><Price product={product} /><p className="mt-3 text-sm text-muted-foreground">{product.category}</p></div></div><fieldset><legend className="mb-2 text-sm">Color</legend><div className="flex flex-wrap gap-2">{product.colors.map(value=><Button type="button" key={value} variant={color===value?'editorial':'outline'} size="chip" onClick={()=>setColor(value)}><span className={`swatch swatch-${value.toLowerCase()}`} />{value}</Button>)}</div></fieldset><fieldset><legend className="mb-2 text-sm">Size</legend><div className="flex flex-wrap gap-2">{product.sizes.map(value=><Button type="button" key={value} aria-pressed={size===value} variant={size===value?'editorial':'outline'} size="chip" onClick={()=>{setSize(value);setError('');}}>{value}</Button>)}</div></fieldset><label className="text-sm">Quantity<input aria-label="Quick add quantity" type="number" min={1} max={product.stock} value={quantity} onChange={e=>setQuantity(Math.max(1,Math.min(product.stock,Number(e.target.value)||1)))} className="ml-4 w-20 rounded-sm border border-input p-2" /></label>{error?<p role="alert" className="text-sm text-destructive">{error}</p>:null}<Button disabled={product.stock<=0} onClick={()=>{if(!size){setError('Please select a size.');return;}addToCart(product,size,color,quantity);onClose();}}>Add to Cart</Button></DialogContent></Dialog>;
}

// ─── ReviewForm ───────────────────────────────────────────────────────────────
export function ReviewForm({ productId }: { productId: string }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hovered, setHovered] = useState(0);

  const mutation = useMutation({
    mutationFn: () =>
      api.submitReview({ product_id: productId, customer_name: name, rating, title, body }),
    onSuccess: () => {
      setSubmitted(true);
      void queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });

  if (!apiEnabled) {
    return (
      <p className="text-sm text-muted-foreground">Reviews require the backend to be running.</p>
    );
  }

  if (submitted) {
    return (
      <p className="mt-4 text-sm text-sage">Your review has been submitted for approval.</p>
    );
  }

  return (
    <form
      className="mt-6 grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!rating || !name.trim()) return;
        mutation.mutate();
      }}
    >
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Rating <span aria-hidden="true">*</span></legend>
        <div className="flex gap-1" role="group" aria-label="Select rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
              aria-pressed={rating >= star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="focus-veloura p-0.5"
            >
              <Star
                className={`size-5 transition-colors ${
                  (hovered || rating) >= star
                    ? 'fill-sage text-sage'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>
      </fieldset>

      <label className="grid gap-1 text-sm">
        <span className="font-semibold">Name <span aria-hidden="true">*</span></span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="rounded-sm border border-input bg-background px-3 py-2 text-sm"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-semibold">Review title <span className="font-normal text-muted-foreground">(optional)</span></span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sum it up in a few words"
          className="rounded-sm border border-input bg-background px-3 py-2 text-sm"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-semibold">Review <span className="font-normal text-muted-foreground">(optional)</span></span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell us what you think"
          rows={4}
          className="rounded-sm border border-input bg-background px-3 py-2 text-sm"
        />
      </label>

      {mutation.isError ? (
        <p role="alert" className="text-sm text-destructive">
          Something went wrong. Please try again.
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={!rating || !name.trim() || mutation.isPending}
        className="w-fit"
      >
        {mutation.isPending ? 'Submitting…' : 'Submit Review'}
      </Button>
    </form>
  );
}

// ─── LiveReviews ──────────────────────────────────────────────────────────────
const STATIC_DEMO_REVIEWS = [
  { body: 'Beautifully cut, and the fabric feels excellent.', author: 'Ayesha', note: 'Sample review' },
  { body: 'An easy addition to my everyday wardrobe.', author: 'Hamza', note: 'Sample review' },
];

export function LiveReviews({ productId, fallbackCount: _fallbackCount }: { productId: string; fallbackCount: number }) {
  const { data } = useReviews(productId);
  const productReviews = data?.reviews?.filter(r => r.product_id === productId) ?? [];

  if (productReviews.length > 0) {
    return (
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {productReviews.map((review) => (
          <blockquote key={review.id} className="border-t border-border pt-5">
            {review.title ? <p className="text-sm font-semibold">{review.title}</p> : null}
            <p className="text-sm">{review.body}</p>
            <footer className="mt-3 text-xs text-muted-foreground">
              {review.customer_name}
              {review.created_at
                ? ` · ${new Date(review.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}`
                : null}
            </footer>
          </blockquote>
        ))}
      </div>
    );
  }

  if (!apiEnabled) {
    // Offline — show the existing static demo review blockquotes
    return (
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {STATIC_DEMO_REVIEWS.map((review) => (
          <blockquote key={review.body} className="border-t border-border pt-5">
            <p className="text-sm">{review.body}</p>
            <footer className="mt-3 text-xs text-muted-foreground">
              {review.author} · {review.note}
            </footer>
          </blockquote>
        ))}
      </div>
    );
  }

  // API enabled but no reviews yet
  return (
    <p className="mt-6 text-sm text-muted-foreground">Be the first to leave a review.</p>
  );
}
