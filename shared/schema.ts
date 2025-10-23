import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

// Product Configuration Schema
export const productSchema = z.object({
  id: z.string(),
  deviceName: z.string(), // For MobileAPI.dev lookup (e.g., "iPhone 15 Pro")
  displayName: z.string(),
  model: z.string(),
  colorOptions: z.array(z.string()).optional(), // Available colors for this model
  storageOptions: z.array(z.object({
    capacity: z.string(), // e.g., "128GB", "256GB"
    price: z.number(), // in INR
    originalPrice: z.number().optional(), // Original price before discount
    discount: z.number().optional(), // Discount percentage
  })),
  rating: z.number().optional(), // Product rating (e.g., 4.5)
  specs: z.array(z.string()),
  releaseDate: z.string().optional(),
  imagePath: z.string().optional(), // Path to local image file
});

export type Product = z.infer<typeof productSchema>;

// Payment Configuration Schema
export const paymentConfigSchema = z.object({
  upiId: z.string(),
  qrCodeUrl: z.string(),
  defaultAdvancePayment: z.number(), // Default ₹550
});

export type PaymentConfig = z.infer<typeof paymentConfigSchema>;

// Store Configuration Schema (combines products and payment info)
export const storeConfigSchema = z.object({
  products: z.array(productSchema),
  paymentConfig: paymentConfigSchema,
});

export type StoreConfig = z.infer<typeof storeConfigSchema>;

// Cart Item Schema
export const cartItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  storage: z.string(),
  color: z.string().optional(),
  quantity: z.number().min(1),
  addedAt: z.string(),
});

export type CartItem = z.infer<typeof cartItemSchema>;

// Insert Cart Item Schema
export const insertCartItemSchema = z.object({
  productId: z.string(),
  storage: z.string(),
  color: z.string().optional(),
  quantity: z.number().min(1).default(1),
});

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

// Order Schema
export const orderSchema = z.object({
  id: z.string(),
  customerName: z.string(),
  phone: z.string(),
  address: z.string(),
  pinCode: z.string(),
  productId: z.string(),
  productName: z.string(),
  storage: z.string(),
  color: z.string().optional(),
  fullPrice: z.number(),
  paidAmount: z.number(),
  remainingBalance: z.number(),
  paymentType: z.enum(["full", "advance"]),
  paymentScreenshot: z.string(), // filename
  createdAt: z.string(),
});

export type Order = z.infer<typeof orderSchema>;

// Insert Schemas for forms
export const insertOrderSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  address: z.string().min(10, "Please provide a complete delivery address"),
  pinCode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
  productId: z.string(),
  storage: z.string(),
  color: z.string().optional(),
  paymentType: z.enum(["full", "advance"]),
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;

// MobileAPI.dev response types
export type MobileDeviceImage = {
  status: boolean;
  data: {
    image: string;
    name: string;
  };
};

export type MobileAPIPhone = {
  name: string;
  image: string;
  specs: {
    cpu?: string;
    ram?: string;
    storage?: string;
    display?: string;
    battery?: string;
    camera?: string;
  };
  releaseDate?: string;
};

export type MobileAPIPhonesResponse = {
  status: boolean;
  data: MobileAPIPhone[];
};

// Admin Settings Schema
export const adminSettingsSchema = z.object({
  id: z.string().default("default"),
  upiQrImage: z.string().optional(), // Path to uploaded QR code image
  telegramBotToken: z.string().optional(),
  telegramChatId: z.string().optional(),
  updatedAt: z.string(),
});

export type AdminSettings = z.infer<typeof adminSettingsSchema>;

// Insert Admin Settings Schema
export const insertAdminSettingsSchema = z.object({
  upiQrImage: z.string().optional(),
  telegramBotToken: z.string().optional(),
  telegramChatId: z.string().optional(),
});

export type InsertAdminSettings = z.infer<typeof insertAdminSettingsSchema>;

// Product Price Override Schema (for admin to override product prices)
export const productPriceOverrideSchema = z.object({
  productId: z.string(),
  storage: z.string(),
  price: z.number(),
  originalPrice: z.number().optional(),
  discount: z.number().optional(),
});

export type ProductPriceOverride = z.infer<typeof productPriceOverrideSchema>;

// Insert Product Price Override Schema
export const insertProductPriceOverrideSchema = z.object({
  productId: z.string(),
  storage: z.string(),
  price: z.number().min(0, "Price must be positive"),
  originalPrice: z.number().optional(),
  discount: z.number().optional(),
});
