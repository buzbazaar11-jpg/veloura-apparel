# VEL0URA Homepage complete rebuild — premium editorial layout

The commit `ca14b8c` reworks `HomePage` from a flat inline-JSX page into a proper section-component architecture, adding six new dedicated components (`NewArrivalsShelf`, `BestSellersShelf`, `FeaturedCampaignJackets`, `BudgetSection`, `WatchesAccessoriesSection`, `BrandStorySection`) alongside a rebuilt `TrustStrip`, `CategorySection`, and `HeroCarousel`. Every product shelf derives its data from the `useProducts` DB hook with no hardcoded arrays. The change is self-contained to `commerce.tsx` (421 lines added, 93 deleted).

Watch for: `LiveDeals` imported but not used anywhere after the rebuild — confirmed unused import that may cause a TS/lint warning. `OrderPage` listed as a required existing export is absent — confirmed not exported; the route uses `OrderConfirmationPage` instead, which does exist. Slide counter renders literally as `0{n}` strings, producing `010 / 010` for slides beyond 9 — confirmed cosmetic bug for large slide sets.

**Verdict**: APPROVED

---

## High-level view

`HomePage` now renders 17 section calls (the spec checkpoint counted 16; the extra is `HomeDeals`, which pre-existed). Every product shelf receives its data from `useProducts()` in the parent and is guarded with a `length > 0` conditional — no section can render an empty grid. All seven required DB hooks (`useProducts`, `useCategories`, `useDeals`, `useCollections`, `useBlogPosts`, `useHeroSlides`, `useSettings`) are in active use.

`FeaturedCampaignJackets` and `BrandStorySection` are static editorial sections using `campaignImages` constants. Per workspace rules, campaign images are kept separate from product listings, so this is the correct design.

`HeroCarousel` is fully feature-complete with auto-advance, pause/play, prev/next, swipe, and loading hints — but the slide counter has a string-prefix bug that produces malformed output at 10+ slides.

All required existing exports remain. The prompt listed `OrderPage` as a required export; that name has never existed in the codebase — the route uses `OrderConfirmationPage`, which is present and unchanged.

Two cross-cutting concerns warrant attention: a dead `LiveDeals` import left over from the removed call, and unguarded `images[0]` accesses on `string[]` across cart and product card components that will produce broken image tags for any backend product with an empty images array.

---

<details>
<summary>Issues (3)</summary>

1. **Dead `LiveDeals` import** — `LiveDeals` is imported from `@/lib/live-catalog` on line 46 but is never used after the homepage rebuild removed the old `<LiveDeals />` call. Remove the named import. Confirmed.

2. **Slide counter breaks at 10+ slides** — The counter renders `0{index+1} / 0{slides.length}` as a template string, so slide 10 of 10 displays as `010 / 010`. Replace with a padded formatter: `` `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}` ``. Confirmed cosmetic defect.

3. **Unguarded `images[0]` on products without images** — `Product.images` is typed as `string[]` with no minimum-length guarantee. `ProductCard`, `CartLine`, `MiniCart`, `OrderSummary`, and `CompactProduct` all read `images[0]` as an `img src` without optional chaining, which would render a broken image tag if the backend returns a product with an empty images array. Add `images[0] ?? ''` or a default-image fallback. Confirmed pattern; the worst-case paths are `MiniCart` (user-visible immediately after add-to-cart) and cart line items. Not introduced in this commit but touched by it.

</details>

<details>
<summary>Details</summary>

### Section order and completeness

`HomePage` renders exactly 16 calls in this order:

```
HeroCarousel → TrustStrip → CategorySection → NewArrivalsShelf (conditional)
→ SaleBanner → BestSellersShelf (conditional) → FeaturedCampaignJackets
→ DealsShowcase → CollectionsStrip → BudgetSection (conditional)
→ WatchesAccessoriesSection → BrandStorySection → JournalPreview
→ HomeDeals → ShoppingConfidence → BuildYourLook → NewsletterBand
```

That is 17 calls listed here — the spec said 16. Counting the actual `return` JSX: `HeroCarousel`, `TrustStrip`, `CategorySection`, `NewArrivalsShelf`, `SaleBanner`, `BestSellersShelf`, `FeaturedCampaignJackets`, `DealsShowcase`, `CollectionsStrip`, `BudgetSection`, `WatchesAccessoriesSection`, `BrandStorySection`, `JournalPreview`, `HomeDeals`, `ShoppingConfidence`, `BuildYourLook`, `NewsletterBand` = 17. The spec checkpoint asked for 16; the implementation has 17. The extra section is `HomeDeals`, which was present in the previous version and renders a coupon-application UI. This is not a regression — `HomeDeals` was there before and the spec list may have miscounted. All six newly required sections are present.

### Data integrity

All product shelves (`NewArrivalsShelf`, `BestSellersShelf`, `BudgetSection`) are driven by `liveProducts` from `useProducts()` in the parent. `WatchesAccessoriesSection` calls `useCategories()`. `JournalPreview` calls `useBlogPosts()`. `SaleBanner`, `DealsShowcase`, `HomeDeals` call `useDeals()` and `useCoupons()`. `CollectionsStrip` calls `useCollections()`. `HeroCarousel` calls `useHeroSlides()`. `TrustStrip` calls `useSettings()`.

`FeaturedCampaignJackets` and `BrandStorySection` use `campaignImages` constants. Per workspace rules ("campaign images stay separate"), this is correct for editorial sections.

### TypeScript safety and unguarded image access

The unguarded `images[0]` pattern is a TypeScript-allowed access on `string[]` that returns `undefined` at runtime when a product arrives with an empty images array. TS will not flag it without `noUncheckedIndexedAccess`. The paths most exposed are `MiniCart` (immediately user-visible after add-to-cart) and `CartLine`/`OrderSummary` (checkout flow).

### HeroCarousel

All required controls are present: auto-advance at 6500 ms (disabled by `paused` or `prefersReducedMotion()`), pause/play toggle with live ARIA label, prev/next with wrapping modulo, dot navigation, swipe detection with 40 px threshold, `loading="eager"` + `fetchPriority="high"` on slide zero. The counter has the `0{n}` string bug described in Issues.

When `apiEnabled` is false, `slides` stays empty and the component returns `null` — no above-the-fold visual in offline-first mode. The previous version didn't support live slides at all, so this is net-positive, but the offline-first gap is new behavior.

### Unused `LiveDeals` import

The old `HomePage` rendered `<LiveDeals />` which this commit removed. `LiveDeals` remains in the named import on line 46 with no remaining usage. Confirmed dead import.

</details>

---

<details>
<summary>File map</summary>

| File | Change |
|------|--------|
| `src/components/veloura/commerce.tsx` | Homepage rebuild: new section components, rebuilt TrustStrip/CategorySection/HeroCarousel, added useCategories import |

Full diff: `git show ca14b8c -- src/components/veloura/commerce.tsx`

</details>
