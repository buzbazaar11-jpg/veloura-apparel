<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- All storefront logo placements use the shared Logo component and the transparent source asset so brand changes stay consistent.
- Customer trust content and offer/contact overlays live in customer-confidence.tsx and use existing cart coupon logic, keeping the storefront frontend-only.
- Navbar derives homepage and scroll states from the router and browser scroll position so the inset navigation stays readable without covering page content.
- Mobile shopping destinations live in the shared MobileShoppingNav; reserving bottom space and hiding it under shopping overlays prevents obscured content.
- Catalog photography is assigned centrally by product category and tags; campaign images stay separate so product listings show the relevant item rather than unrelated models.
- The FastAPI backend lives in /backend and is reached only through src/lib/api.ts when VITE_API_URL is set, so the storefront still works offline-first without it.
- Shopping departments use the shop URL's department filter and shared audience normalization, keeping desktop/mobile navigation consistent and preventing cross-department product leakage.
