# Design Guidelines: onlyiphones.store

## Design Approach
**Reference-Based: Apple-Inspired E-Commerce**

Drawing inspiration from Apple's retail design philosophy - characterized by generous whitespace, premium product photography, sophisticated restraint, and intuitive user flows. The design emphasizes product beauty while maintaining absolute clarity in the purchasing journey.

## Typography System

**Primary Font**: SF Pro Display (via Google Fonts proxy: Inter)
- Hero/Product Names: 48px (mobile: 32px), weight 700, tracking -0.02em
- Section Headings: 36px (mobile: 24px), weight 600, tracking -0.01em
- Body Text: 16px, weight 400, line-height 1.6
- Price Labels: 24px (mobile: 20px), weight 600
- Buttons/CTAs: 16px, weight 500, tracking 0.01em
- Captions/Meta: 14px, weight 400

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16, 24
- Micro spacing (within components): p-2, gap-2
- Component padding: p-4, p-6
- Section padding: py-12 (mobile), py-16 (tablet), py-24 (desktop)
- Grid gaps: gap-6 (mobile), gap-8 (desktop)

**Container Strategy**:
- Full-width hero: w-full with max-w-7xl inner content
- Product grid: max-w-7xl, px-4
- Checkout flow: max-w-2xl for forms, centered
- Content sections: max-w-6xl

## Component Library

### Hero Section
- Full-width, 70vh height on desktop, 60vh on mobile
- Large hero image showcasing premium iPhone lifestyle photography
- Centered overlay content with blurred backdrop (backdrop-blur-xl, bg-white/10)
- Headline: "Premium iPhones. Delivered Across India."
- Subheading explaining iPhone 13-17 availability
- CTA button with blurred background (backdrop-blur-md, bg-white/20, border border-white/30)

### Product Cards
- Clean white cards with subtle shadow (shadow-sm hover:shadow-xl transition)
- 16:9 aspect ratio product images, object-fit contain on neutral background
- Card structure: Image (60% height) → Product name → Storage variant → Price (₹) → Buy Now button
- Hover state: Lift effect (transform scale-105), enhanced shadow
- Grid: 1 column (mobile), 2 columns (tablet), 3 columns (desktop: lg:grid-cols-3)
- Rounded corners: rounded-2xl

### Navigation Header
- Sticky top bar, backdrop-blur-lg, bg-white/90
- Logo: "onlyiphones.store" in bold, left-aligned
- Minimalist: Cart icon (Material Icons: shopping_cart), centered brand, search icon right
- Height: h-16, border-b border-gray-200
- Mobile: Hamburger menu for condensed view

### Checkout Progress Indicator
- Three-step flow: Address → Payment → Confirmation
- Horizontal stepper with connecting lines
- Active step: filled circle with checkmark icon, bold text
- Completed: green checkmark, gray line
- Upcoming: outlined circle, muted text
- Position: top of checkout container, mb-12

### Payment Section
- Two-column layout on desktop: QR Code left, Payment details right
- QR code: Large (256px), centered, with shadow-lg
- Payment options displayed as radio cards (border-2 on selected)
- Upload payment screenshot: Drag-and-drop zone with dashed border, icon-centered
- Amount breakdowns: Clean table format (flex justify-between for each row)

### Order Confirmation
- Success icon: Large green checkmark (Material Icons: check_circle, 96px)
- Order number: Prominent display, monospace font
- Summary card: White bg, rounded-xl, p-8, shadow-md
- Next steps: Numbered list with icons (local_shipping, account_balance_wallet)

### Buttons
Primary CTA: Rounded-full, px-8 py-3, bg-gradient (purple to blue), white text, shadow-lg, hover:shadow-2xl
Secondary: Rounded-full, px-8 py-3, border-2, transparent bg, hover:bg-gray-50
Ghost (on images): backdrop-blur-md, bg-white/20, border border-white/30, rounded-full, no hover blur changes

### Form Inputs
- Rounded-lg, border border-gray-300, px-4 py-3
- Focus: ring-2 ring-blue-500, border-blue-500
- Labels: Above input, text-sm font-medium mb-2
- Error states: red border, red text below input with warning icon

### Icons
**Library**: Material Icons (via CDN)
- Payment: qr_code, account_balance, upload_file
- Shipping: local_shipping, pin_drop
- Actions: shopping_cart, check_circle, arrow_forward
- UI: menu, close, search

## Images

**Hero Image**: Full-width lifestyle shot of multiple iPhones arranged artistically on premium surface (marble/wood), soft shadows, professional product photography aesthetic. Position: Cover background with dark overlay (bg-black/30) for text contrast.

**Product Images**: Clean iPhone product shots on white/light gray background, centered, consistent lighting, showing device from front angle with slight perspective. Fetched dynamically from MobileAPI.dev.

**QR Code Placeholder**: Generated dynamically, displayed at 256x256px within bordered container.

## Animations

**Use Sparingly** - Only for purposeful feedback:
- Card hover: transition-all duration-300 (scale + shadow)
- Button hover: transition-transform duration-200 (subtle scale-105)
- Page transitions: Fade-in on load (opacity 0→1, duration-500)
- Success confirmation: Check icon scale animation (scale-0 to scale-100)

**Prohibited**: Auto-play carousels, parallax effects, excessive scroll animations

## Mobile-First Responsive Breakpoints

- Mobile (base): Single column, stacked layout, touch-friendly targets (min 44px)
- Tablet (md: 768px): 2-column product grid, side-by-side form sections
- Desktop (lg: 1024px): 3-column product grid, full checkout layout
- Wide (xl: 1280px): Max-width containers, enhanced spacing

## Visual Hierarchy Principles

1. **Generous Whitespace**: Never crowd elements, minimum py-6 between sections
2. **Scale Contrast**: Dramatic size differences between headlines (48px) and body (16px)
3. **Weight Variation**: Bold headlines (700), medium UI (500), regular body (400)
4. **Depth Through Shadow**: Subtle elevation for cards, prominent for modals
5. **Focused Color Usage**: Reserve accent colors for CTAs and active states only