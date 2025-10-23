# onlyiphones.store - E-commerce Platform

## Project Overview

A modern, mobile-first e-commerce platform for selling iPhone 13 to iPhone 17 exclusively in India. The application features an Apple-inspired design with flexible payment options (full payment or advance payment) and a streamlined guest checkout experience.

## Architecture

### Full-Stack JavaScript Application
- **Frontend**: React 18 + TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js + TypeScript
- **Data Storage**: JSON-based configuration with file-persisted orders
- **File Uploads**: Multer for payment screenshot handling

### Key Features
1. Dynamic iPhone image fetching via MobileAPI.dev API
2. JSON-based product configuration (easily editable)
3. Guest checkout (no user accounts required)
4. Dual payment options: Full price or ₹550 advance
5. Manual UPI payment with QR code display
6. Payment screenshot upload during checkout
7. Order confirmation with balance payment instructions
8. India-focused (INR pricing, PIN code validation)

## Recent Changes (October 23, 2025)

### Initial Implementation
- **Schema Design**: Created comprehensive TypeScript schemas for products, orders, and payment configuration
- **Frontend Components**: Built all UI components following Apple-inspired design guidelines:
  - Hero section with premium lifestyle imagery
  - Product catalog with dynamic image loading
  - Multi-step checkout flow (Address → Payment → Confirmation)
  - Order summary and confirmation pages
- **Backend APIs**: Implemented all endpoints for product management, order creation, and MobileAPI.dev proxy
- **Configuration System**: Created JSON-based config for easy product and payment management
- **File Upload**: Integrated multer for payment screenshot handling

## Project Structure

```
├── client/src/
│   ├── components/         # UI components
│   │   ├── Header.tsx
│   │   ├── HeroSection.tsx
│   │   ├── ProductCard.tsx
│   │   └── checkout/       # Checkout flow components
│   ├── pages/              # Page components
│   │   ├── HomePage.tsx
│   │   ├── CheckoutPage.tsx
│   │   └── OrderConfirmationPage.tsx
│   └── lib/                # Utilities
├── server/
│   ├── routes.ts           # API endpoints
│   └── storage.ts          # Data persistence layer
├── shared/
│   └── schema.ts           # Shared TypeScript types
├── config/
│   └── store-config.json   # Product & payment configuration
├── data/
│   └── orders.json         # Persisted orders
└── uploads/
    └── payment-screenshots/ # Customer payment proofs
```

## Configuration

### Environment Variables
- `MOBILEAPI_DEV_KEY`: API key for MobileAPI.dev (required)
- `SESSION_SECRET`: Session secret for Express

### Store Configuration (`config/store-config.json`)
Easily editable JSON file containing:
- Product catalog (iPhone 13-17)
- Storage options and prices
- Payment configuration (UPI ID, QR code URL, advance amount)

## API Endpoints

### Products
- `GET /api/config` - Full store configuration
- `GET /api/products` - Product catalog
- `GET /api/device-image/:deviceName` - Proxied MobileAPI.dev image fetch

### Orders
- `POST /api/orders` - Create order (multipart/form-data with screenshot)
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders` - Get all orders

## User Preferences

### Design System
- **Apple-inspired aesthetic**: Clean, minimal, premium feel
- **Color palette**: Blue primary (#3B82F6), neutral backgrounds
- **Typography**: Inter font family throughout
- **Spacing**: Generous whitespace, consistent padding
- **Components**: Shadcn UI components with custom styling
- **Icons**: Material Icons for consistency
- **Animations**: Subtle, smooth transitions

### Coding Style
- TypeScript strict mode
- React functional components with hooks
- TanStack Query for server state
- Zod for runtime validation
- Clean separation: UI components vs. business logic

## Development Workflow

### Running the Application
```bash
npm run dev  # Starts on port 5000
```

### Making Changes

**Adding/Editing Products:**
1. Edit `config/store-config.json`
2. Update product array with new models/pricing
3. Changes take effect immediately (no restart needed)

**Updating Payment Info:**
1. Edit `paymentConfig` in `config/store-config.json`
2. Update UPI ID and QR code URL
3. Adjust advance payment amount if needed

**Modifying UI:**
1. Components are in `client/src/components/`
2. Pages are in `client/src/pages/`
3. Follow existing design patterns
4. Use Shadcn UI components where possible

## Data Flow

1. **Product Browsing**: Frontend fetches products from `/api/products`, images from `/api/device-image`
2. **Checkout**: Multi-step form collects address → payment details
3. **Order Creation**: Frontend POSTs to `/api/orders` with FormData (includes screenshot)
4. **Order Confirmation**: Displays order details from `/api/orders/:id`

## Testing

### Manual Testing Checklist
- [ ] Homepage loads with product grid
- [ ] Product images load from MobileAPI.dev
- [ ] Storage selection updates price
- [ ] Checkout validates address fields
- [ ] Payment QR code displays correctly
- [ ] Screenshot upload works
- [ ] Order confirmation shows correct details
- [ ] Mobile responsive on all pages

## Future Enhancements (Not in MVP)

- Admin dashboard for order management
- Automated order status tracking
- Customer email notifications
- Inventory management
- Advanced analytics
- Integration with shipping APIs
- SMS notifications via Twilio

## Notes

- This is a guest-checkout only system (no user authentication)
- Payment verification is manual (admin reviews screenshots)
- Orders are stored in JSON file (suitable for small-scale operations)
- For production at scale, consider migrating to PostgreSQL
- MobileAPI.dev free tier: 500 requests/month
