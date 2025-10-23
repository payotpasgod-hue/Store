# onlyiphones.store - Premium iPhone E-commerce Platform

A modern, mobile-first e-commerce website for selling iPhone 13 to iPhone 17 in India. Built with React, Express, and TypeScript.

## Features

- 🎨 **Apple-Inspired Design** - Clean, minimal, premium aesthetic
- 📱 **Mobile-First** - Fully responsive across all devices
- 🖼️ **Dynamic Images** - Fetches iPhone images from MobileAPI.dev
- 💰 **Flexible Payments** - Full payment or ₹550 advance option
- 📦 **Guest Checkout** - No account required
- 🎯 **India-Focused** - INR pricing, PIN code validation
- 📸 **Payment Screenshots** - Upload payment proof during checkout
- 🔒 **Secure** - API key management via environment variables

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS + Shadcn UI
- Wouter for routing
- TanStack Query for data fetching
- Material Icons

### Backend
- Express.js with TypeScript
- Multer for file uploads
- JSON-based configuration
- In-memory storage with file persistence

## Quick Start

### Prerequisites
- Node.js 20+
- MobileAPI.dev API key (get free at https://mobileapi.dev)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd onlyiphones-store
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file or add to Replit Secrets:
   ```
   MOBILEAPI_DEV_KEY=your_api_key_here
   SESSION_SECRET=random_secret_string
   ```

4. **Run the application**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open http://localhost:5000 in your browser
   - The app runs on a single port (backend + frontend)

## Configuration

### Products Configuration

Edit `config/store-config.json` to manage:

- **Products**: Add/remove iPhone models with pricing
- **Payment Config**: Update UPI ID and QR code URL
- **Advance Payment**: Change default advance amount

Example structure:
```json
{
  "products": [
    {
      "id": "iphone-17-pro",
      "deviceName": "iPhone 17 Pro",
      "displayName": "iPhone 17 Pro",
      "model": "A3101",
      "storageOptions": [
        { "capacity": "128GB", "price": 134900 }
      ],
      "specs": ["6.3-inch display", "A19 Pro chip"],
      "releaseDate": "September 2025"
    }
  ],
  "paymentConfig": {
    "upiId": "your-upi@bank",
    "qrCodeUrl": "https://your-qr-code-url",
    "defaultAdvancePayment": 550
  }
}
```

### Updating Payment Details

1. Replace `upiId` with your UPI ID
2. Generate QR code at https://www.qr-code-generator.com/
3. Upload QR code image and update `qrCodeUrl`
4. Adjust `defaultAdvancePayment` as needed

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   └── lib/           # Utilities and config
├── server/                 # Backend Express application
│   ├── routes.ts          # API endpoints
│   └── storage.ts         # Data storage layer
├── shared/                 # Shared TypeScript types
│   └── schema.ts          # Zod schemas and types
├── config/                 # Configuration files
│   └── store-config.json  # Products and payment config
├── data/                   # Persisted data
│   └── orders.json        # Order records
└── uploads/                # Payment screenshots
    └── payment-screenshots/
```

## API Endpoints

### Public Endpoints

- `GET /api/config` - Get store configuration
- `GET /api/products` - Get all products
- `GET /api/device-image/:deviceName` - Get device image via proxy
- `POST /api/orders` - Create new order (with file upload)
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders` - Get all orders

## Order Flow

1. **Browse Products** - Customer views iPhone catalog
2. **Select Product** - Choose model and storage
3. **Enter Details** - Provide name, phone, address, PIN code
4. **Payment** - Select full/advance payment, scan QR, upload screenshot
5. **Confirmation** - Receive order ID and next steps

## Data Storage

- **Orders**: Stored in `data/orders.json`
- **Screenshots**: Saved in `uploads/payment-screenshots/`
- **Config**: Managed in `config/store-config.json`

## Development

### Running in Development Mode

```bash
npm run dev
```

This starts:
- Vite dev server for frontend (with HMR)
- Express server for backend
- Both served on port 5000

### Building for Production

```bash
npm run build
```

## Deployment

### Deploying on Replit

1. Import project to Replit
2. Add `MOBILEAPI_DEV_KEY` to Secrets
3. Click "Run" - automatically starts on port 5000
4. Use the provided Replit URL to access your store

### Deploying Elsewhere

1. Set environment variables
2. Run `npm run build`
3. Start with `npm start`
4. Ensure port 5000 is accessible

## Security Notes

- API keys are stored in environment variables
- Payment screenshots are stored locally (not exposed publicly)
- No sensitive customer data is logged
- File uploads limited to 10MB images only

## Customization

### Changing Colors

Edit `client/src/index.css` CSS variables for light/dark mode.

### Adding Products

Add entries to `config/store-config.json` products array.

### Modifying Checkout Flow

Update components in `client/src/components/checkout/`

## Support

For issues or questions:
1. Check configuration in `store-config.json`
2. Verify API key in environment variables
3. Check server logs for errors
4. Review order data in `data/orders.json`

## License

MIT License - feel free to use for your business!

---

Built with ❤️ for iPhone enthusiasts in India 🇮🇳
