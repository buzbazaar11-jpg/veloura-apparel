# New IVORA: The Fashion Forward Experience

Build a complete, polished, responsive and fully functional premium fashion e-commerce website called IVORA.

The website should look like a real modern fashion brand, not a generic Shopify template, basic React project, Bootstrap website, or old-fashioned clothing store.

The overall direction should be:

Clean + Modern + Premium + Minimal + Editorial + Fashion-forward

Keep the design light, elegant and spacious.

Do NOT create excessive animations or complicated scroll effects.

The website should prioritize:

Visual quality

Typography

Product photography

Clean spacing

Easy navigation

Smooth interactions

Responsive design

Realistic e-commerce functionality

1. BRAND IDENTITY

Brand name:

IVORA

Use the name IVORA consistently throughout the entire website.

Do not use generic names such as:

Fashion Store

Clothing Brand

Demo Store

My Store

Shop

Everything should be branded as IVORA.

Brand personality:

Premium

Modern

Minimal

Sophisticated

Elegant

Confident

Contemporary

Fashion-forward

The website should feel like IVORA is an established fashion brand.

2. DESIGN SYSTEM

Use a light luxury editorial design.

Primary background:

#F7F6F2

Secondary background:

#FFFFFF

Primary text:

#111111

Secondary text:

#6F6B65

Border:

rgba(17,17,17,0.08)

Accent:

Use a subtle muted sage/olive tone.

Do not use loud neon colors.

Do not use excessive gradients.

Do not use dark-mode-first styling.

3. GLASSMORPHISM

Use subtle glassmorphism where appropriate.

Example:

background: rgba(255,255,255,0.55);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid rgba(255,255,255,0.7);


Use glass effects mainly for:

Navbar

Search overlay

Cart drawer

Wishlist controls

Filter controls

Floating buttons

Small UI cards

Build Your Look panel

Do NOT make every product card glass.

Product imagery should remain clean and premium.

Glass should feel subtle and sophisticated, not futuristic or excessive.

4. TYPOGRAPHY

Use a modern premium font combination.

Headings should be editorial and impactful.

Use:

Large headlines

Small uppercase labels

Clean body text

Generous letter spacing

Strong hierarchy

Large whitespace

Example headline:

THE NEW STANDARD.

Avoid:

Too many font styles

Too many font weights

Cartoon-like typography

Generic default browser fonts

Typography should feel like a premium fashion editorial.

5. GLOBAL LAYOUT

Use generous whitespace.

Do not make the page feel crowded.

Use:

Large image areas

Wide sections

Editorial layouts

Asymmetric grids where appropriate

Clean product grids

Consistent spacing

Large visual hierarchy

The site should feel expensive because of its restraint.

6. NAVBAR

Create a modern floating/sticky navbar.

Desktop:

IVORA

New Arrivals
Shop
Collections
Journal
About

Search
Wishlist
Cart


The navbar should be:

Minimal

Clean

Slightly transparent

Subtle glass effect

Rounded/pill-like if it fits the design

Not oversized

When the user scrolls:

Navbar becomes slightly more compact

Background becomes slightly more opaque

Blur increases subtly

Do not create dramatic navbar animations.

Mobile navbar:

IVORA logo

Search

Cart

Hamburger menu

Mobile menu should open smoothly.

Menu items:

New Arrivals

Shop

Collections

Journal

About

Wishlist

Contact

7. HERO SECTION

Create a large premium hero section.

The hero must contain 3 slides.

Use high-quality fashion imagery.

If real product images are not available, use appropriate dummy fashion/product imagery and structure the code so the images can easily be replaced later.

SLIDE 01

Label:

IVORA AW26

Headline:

THE NEW STANDARD.

Product:

IVORA Signature Jacket

CTA:

EXPLORE COLLECTION

SLIDE 02

Label:

IVORA ESSENTIALS

Headline:

EVERYDAY, ELEVATED.

Product:

IVORA Essential Shirt

CTA:

SHOP ESSENTIALS

SLIDE 03

Label:

IVORA SIGNATURE

Headline:

MADE FOR THE MOMENT.

Product:

IVORA Relaxed Trouser

CTA:

DISCOVER IVORA

Each hero slide should include:

Large fashion image

Editorial headline

Small label

Short supporting text

CTA

Slide number

Previous/next controls

Show:

01 / 03

02 / 03

03 / 03

Support:

Click navigation

Previous/next buttons

Swipe gestures on mobile

Automatic slide transition

Hero transitions should be simple, smooth and elegant.

Do NOT create complex scroll-controlled hero animations.

The hero image should NOT travel into the next section.

8. HERO VISUAL STYLE

The hero should feel like a fashion campaign.

Do not make it look like:

A normal product carousel

A discount banner

A generic e-commerce hero

A crowded promotional section

Use:

Large photography

Minimal text

Strong typography

Lots of whitespace

Premium composition

The image should dominate the screen.

9. NEW ARRIVALS

Create:

NEW ARRIVALS

Show 4–8 products.

Use a clean responsive grid.

Each product card should contain:

Product image

Product name

Price

Color

Wishlist icon

Quick Add button

Hover interaction:

Image subtly scales

Second image can crossfade

Quick Add appears smoothly

Wishlist icon changes state

Keep all interactions subtle.

10. PRODUCT CARDS

Product cards should feel premium.

Do not use:

Heavy shadows

Thick borders

Overly rounded cards

Cheap-looking badges

Too much text

Use mostly:

Image

Product name

Price

Small metadata

Allow the product image to remain the main focus.

Add small badges when appropriate:

NEW

BESTSELLER

LOW STOCK

Only show these when relevant.

11. SHOP BY CATEGORY

Create a large visual category section.

Categories:

Men

Women

Unisex

Accessories

Each category should have a large fashion image.

On hover:

Slight image zoom

Subtle overlay

Category name

Explore CTA

Keep it elegant.

12. FEATURED COLLECTION

Create a large editorial banner:

THE IVORA COLLECTION

Supporting text:

Modern essentials designed around clean silhouettes, refined details and effortless everyday style.

Button:

EXPLORE COLLECTION

Use a large high-quality fashion image.

Keep this section visually spacious.

13. SHOP BY MOOD

Create:

WHAT'S YOUR MOOD?

Four visual cards:

MINIMAL

STREET

EVERYDAY

ELEVATED

Each card should use relevant fashion imagery.

Clicking a mood should show/filter related products.

Hover/tap:

Slight image movement

Subtle overlay

Glass CTA

Smooth transition

14. FEATURED PRODUCTS

Create another product showcase using an editorial layout.

Do not use the exact same grid as New Arrivals.

Use a more visual layout such as:

One large product

Two smaller products

Large lifestyle image

Supporting products

The page should feel editorial rather than repetitive.

15. PRODUCT DATABASE

Create realistic dummy products.

Use at least 20 products.

Categories:

Jackets

T-Shirts

Shirts

Trousers

Hoodies

Sneakers

Accessories

Example products:

IVORA Signature Jacket

IVORA Essential Oversized Tee

IVORA Studio Shirt

IVORA Relaxed Cargo

IVORA Core Hoodie

IVORA Minimal Runner

IVORA Everyday Trouser

IVORA Essential Overshirt

IVORA Studio Jacket

IVORA Core Tee

Every product should contain:

id
name
slug
price
category
description
images
colors
sizes
stock
tags
featured
newArrival
bestSeller


Use realistic prices.

16. SHOP PAGE

Create a complete shop page.

Header:

SHOP IVORA

Include:

Search

Category filter

Size filter

Color filter

Price filter

Availability filter

Sort

Sorting options:

Featured

Newest

Price: Low to High

Price: High to Low

Product grid must update dynamically.

Filters must actually work.

Do not create fake filter buttons.

17. SEARCH

Create a modern search experience.

When user clicks Search:

Open a clean large search overlay.

Title:

SEARCH IVORA

Search input should support live product search.

For example:

Typing:

jacket

should immediately show matching products.

Show:

Product image

Product name

Price

Category

Allow clicking a result to open the product page.

18. PRODUCT DETAIL PAGE

Create a premium product detail page.

Desktop:

Large image gallery on the left.

Product information on the right.

Show:

Product name

Price

Color

Available colors

Size selector

Size guide

Stock status

Quantity selector

ADD TO CART

BUY NOW

♡ WISHLIST

Below:

DESCRIPTION

THE FIT

MATERIAL

CARE

DELIVERY

RETURNS

Keep the layout clean.

19. PRODUCT IMAGE GALLERY

Product gallery should support:

Multiple images

Thumbnail navigation

Large main image

Image zoom

Mobile swipe

Use smooth image transitions.

20. SIZE GUIDE

Create a clean size guide modal.

Include:

XS

S

M

L

XL

XXL

Show:

Chest

Waist

Length

Use dummy but realistic measurements.

Add:

HOW TO MEASURE

with simple instructions.

21. COMPLETE THE LOOK

On every relevant product page, show:

COMPLETE THE LOOK

Example:

Black Oversized Jacket

Recommended:

IVORA Essential Tee

IVORA Relaxed Trouser

IVORA Minimal Runner

Each recommendation should have:

Image

Name

Price

Add button

Button:

ADD COMPLETE LOOK

This should add all selected products to cart.

Use simple tag-based recommendation logic.

No AI API required for the MVP.

22. BUILD YOUR LOOK

Create a dedicated section:

BUILD YOUR LOOK

Allow the user to select a product and discover matching products.

Example:

SELECT YOUR PIECE

Jacket

Then show:

COMPLETE THE LOOK

T-Shirt
Trouser
Shoes
Accessory

Use product tags to generate recommendations.

This must actually work.

23. WISHLIST

Create a fully functional wishlist.

User can:

Add product

Remove product

View wishlist

Move product to cart

Wishlist state should persist using localStorage.

Animate the heart icon subtly.

Show:

YOUR WISHLIST

If empty:

YOUR WISHLIST IS EMPTY

Button:

EXPLORE IVORA

24. CART

Create a premium cart drawer.

When the cart icon is clicked, open the cart from the right.

Show:

Product image

Product name

Size

Color

Quantity

Price

Remove button

Allow:

Increase quantity

Decrease quantity

Remove item

Show:

Subtotal

Shipping

Total

Button:

CHECKOUT

Cart should update instantly.

Persist cart using localStorage.

25. MINI CART

After adding a product:

Show a small elegant confirmation:

ADDED TO YOUR BAG

Product image

Product name

Buttons:

VIEW BAG

CONTINUE SHOPPING

Use a subtle slide/fade animation.

26. CHECKOUT

Create a clean single-page checkout.

Sections:

CONTACT

Name

Email

Phone

DELIVERY

Address

City

Postal Code

Country

PAYMENT

Cash on Delivery

Card — Demo

ORDER SUMMARY

Products

Subtotal

Shipping

Total

Button:

PLACE ORDER

Do not connect to a real payment provider.

The payment flow is dummy/demo but must function correctly.

27. ORDER CREATION

When user clicks:

PLACE ORDER

Create a dummy order.

Generate order number:

Example:

IVR-10482

Store the order locally.

Order should contain:

Order ID

Customer details

Products

Quantities

Total

Address

Payment method

Date

Status

Initial status:

CONFIRMED

28. ORDER CONFIRMATION

After checkout show a premium confirmation page.

Headline:

ORDER CONFIRMED

Subtext:

Thank you for choosing IVORA.

Show:

Order number

Products

Total

Delivery address

Payment method

Estimated delivery

Button:

TRACK ORDER

Button:

CONTINUE SHOPPING

29. ORDER TRACKING

Create:

TRACK YOUR IVORA ORDER

Input:

Order Number

Show timeline:

CONFIRMED

↓

PROCESSING

↓

SHIPPED

↓

OUT FOR DELIVERY

↓

DELIVERED

For MVP use local dummy order data.

30. JOURNAL

Create:

THE IVORA JOURNAL

Create 4–6 editorial articles.

Examples:

How to Style an Oversized Jacket

Building a Modern Wardrobe

The Art of Everyday Dressing

Inside IVORA AW26

Each article should have:

Large image

Category

Title

Short description

Read button

Use a fashion editorial layout.

31. ABOUT IVORA

Create a premium About section.

Headline:

DESIGNED FOR EVERYDAY.

Body:

IVORA creates modern essentials focused on clean silhouettes, thoughtful details and effortless style.

Use:

Large image

Short brand story

Minimal typography

Do not make it overly text-heavy.

32. NEWSLETTER

Create:

JOIN THE IVORA WORLD

Text:

Get first access to new collections, exclusive drops and stories from IVORA.

Input:

Email address

Button:

SUBSCRIBE

For MVP, show a success state after submission.

33. FOOTER

Create a clean premium footer.

Show:

IVORA

Shop

New Arrivals

Men

Women

Unisex

Accessories

About

Our Story

Journal

Contact

Support

Shipping

Returns

Size Guide

FAQs

Legal

Privacy

Terms

Social:

Instagram
TikTok
Pinterest

Newsletter signup.

34. RESPONSIVE DESIGN

The website must be fully responsive.

Desktop:

Large editorial imagery

Spacious layouts

Multi-column product grids

Tablet:

Adaptive grids

Reduced spacing

Proper typography scaling

Mobile:

Dedicated mobile layout

Easy navigation

Swipeable hero

2-column product grid where appropriate

Mobile filters

Mobile cart

Mobile checkout

Proper image ratios

Do not simply shrink the desktop version.

35. ANIMATION

IMPORTANT:

Keep animation minimal and sophisticated.

Do NOT add:

Hero image moving into another section

Pinned scroll sections

Jacket flying from left

Shoes flying from right

Complex GSAP scroll choreography

3D product animations

Excessive parallax

Scroll-controlled product transformations

Use only subtle animations:

Fade in

Small slide

Hover scale

Image crossfade

Button transitions

Cart drawer

Search overlay

Mobile menu

Wishlist heart

Page transitions

Animations should support usability rather than dominate the design.

36. PERFORMANCE

Optimize the website for fast loading.

Use:

Lazy loading

Responsive images

Optimized image sizes

Efficient React components

Minimal unnecessary JavaScript

GPU-friendly transitions

Proper code splitting where appropriate

Avoid unnecessary dependencies.

Respect:

prefers-reduced-motion

37. ACCESSIBILITY

Implement:

Semantic HTML

Keyboard navigation

Accessible buttons

Proper labels

Alt text

Visible focus states

Good color contrast

Accessible forms

38. CODE QUALITY

Write clean, maintainable and reusable code.

Use reusable components for:

Navbar

ProductCard

ProductGrid

ProductGallery

WishlistButton

CartDrawer

SearchOverlay

FilterPanel

Button

Modal

SizeGuide

OrderSummary

Footer

Do not duplicate components unnecessarily.

Keep product data separate from UI components.

39. MVP DATA / STATE

No real backend is required.

Use local state and localStorage for the MVP.

Persist:

Cart

Wishlist

Orders

Recently viewed products if implemented

The application should work after refreshing the page.

40. IMPORTANT — NO FAKE FUNCTIONALITY

Do not create buttons that do nothing.

These must actually work:

Hero navigation

Search

Product filters

Product sorting

Product details

Size selection

Add to cart

Remove from cart

Quantity changes

Wishlist

Move wishlist item to cart

Complete the look

Checkout

Place order

Order confirmation

Order tracking

Mobile navigation

41. FINAL VISUAL QUALITY

The final website should feel like a real premium fashion brand.

Think:

Modern fashion editorial + clean luxury e-commerce + subtle glass UI

The website should NOT feel like:

A generic Shopify store

A basic React demo

A Bootstrap template

A school project

An old-fashioned clothing website

An overly animated landing page

Keep the design restrained.

Use beautiful imagery.

Use strong typography.

Use excellent spacing.

Use subtle glass effects.

Use clean product cards.

Make the interface feel intentional.

FINAL GOAL

When someone opens IVORA, the first impression should be:

"This looks like a serious modern fashion brand."

The experience should be:

Beautiful → Clean → Premium → Easy to Browse → Easy to Shop → Fully Functional

The website does not need hundreds of features.

It needs excellent execution of the essentials.

Build the complete IVORA website with all the functionality described above and make every screen polished, responsive and production-quality.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2ffdd32d-a9ea-4a48-bf11-b7fa82d4810c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
