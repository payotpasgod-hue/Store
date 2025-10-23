import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { promises as fs } from "fs";
import path from "path";
import multer from "multer";
import { insertOrderSchema, insertCartItemSchema, type StoreConfig, type Product } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads", "payment-screenshots");
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get store configuration (products + payment config)
  app.get("/api/config", async (req, res) => {
    try {
      const configPath = path.join(process.cwd(), "config", "store-config.json");
      const configData = await fs.readFile(configPath, "utf-8");
      const config: StoreConfig = JSON.parse(configData);
      res.json(config);
    } catch (error) {
      console.error("Error loading config:", error);
      res.status(500).json({ error: "Failed to load store configuration" });
    }
  });

  // Get products list
  app.get("/api/products", async (req, res) => {
    try {
      const configPath = path.join(process.cwd(), "config", "store-config.json");
      const configData = await fs.readFile(configPath, "utf-8");
      const config: StoreConfig = JSON.parse(configData);
      res.json(config.products);
    } catch (error) {
      console.error("Error loading products:", error);
      res.status(500).json({ error: "Failed to load products" });
    }
  });

  // Cart endpoints
  app.get("/api/cart", async (req, res) => {
    try {
      const cartItems = await storage.getCartItems();
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const itemData = insertCartItemSchema.parse(req.body);
      const cartItem = await storage.addCartItem(itemData);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid cart item data", details: error.errors });
      }
      console.error("Error adding to cart:", error);
      res.status(500).json({ error: "Failed to add item to cart" });
    }
  });

  app.patch("/api/cart/:id", async (req, res) => {
    try {
      const { quantity } = req.body;
      if (typeof quantity !== "number" || quantity < 1) {
        return res.status(400).json({ error: "Invalid quantity" });
      }
      const updatedItem = await storage.updateCartItem(req.params.id, quantity);
      if (!updatedItem) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const deleted = await storage.removeCartItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error removing cart item:", error);
      res.status(500).json({ error: "Failed to remove cart item" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      await storage.clearCart();
      res.status(204).send();
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ error: "Failed to clear cart" });
    }
  });

  // Create batch orders with payment screenshot (for cart checkout)
  app.post("/api/orders/batch", upload.single('screenshot'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Payment screenshot is required" });
      }

      const { items, customerName, phone, address, pinCode, paymentType } = req.body;
      
      if (!items) {
        return res.status(400).json({ error: "Items are required" });
      }

      let cartItems;
      try {
        cartItems = JSON.parse(items);
      } catch (e) {
        return res.status(400).json({ error: "Invalid items format" });
      }

      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).json({ error: "Items must be a non-empty array" });
      }

      const configPath = path.join(process.cwd(), "config", "store-config.json");
      const configData = await fs.readFile(configPath, "utf-8");
      const config: StoreConfig = JSON.parse(configData);

      const ordersData = [];

      for (const item of cartItems) {
        const product = config.products.find(p => p.id === item.productId);
        if (!product) {
          return res.status(404).json({ error: `Product ${item.productId} not found` });
        }

        const storageOption = product.storageOptions.find(s => s.capacity === item.storage);
        if (!storageOption) {
          return res.status(404).json({ error: `Storage option ${item.storage} not found for product ${item.productId}` });
        }

        const fullPrice = storageOption.price;
        const paidAmount = paymentType === "full" 
          ? fullPrice 
          : config.paymentConfig.defaultAdvancePayment;
        const remainingBalance = fullPrice - paidAmount;

        ordersData.push({
          customerName,
          phone,
          address,
          pinCode,
          productId: item.productId,
          productName: product.displayName,
          storage: item.storage,
          fullPrice,
          paidAmount,
          remainingBalance,
          paymentType,
          paymentScreenshot: req.file.filename,
        });
      }

      const orders = await storage.createOrders(ordersData);
      res.status(201).json(orders);
    } catch (error) {
      console.error("Error creating batch orders:", error);
      
      if (req.file) {
        try {
          await fs.unlink(path.join(uploadDir, req.file.filename));
        } catch (unlinkError) {
          console.error("Error deleting uploaded file:", unlinkError);
        }
      }
      
      res.status(500).json({ error: "Failed to create orders" });
    }
  });

  // Create order with payment screenshot
  app.post("/api/orders", upload.single('screenshot'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Payment screenshot is required" });
      }

      // Validate order data
      const orderData = insertOrderSchema.parse({
        customerName: req.body.customerName,
        phone: req.body.phone,
        address: req.body.address,
        pinCode: req.body.pinCode,
        productId: req.body.productId,
        storage: req.body.storage,
        paymentType: req.body.paymentType,
      });

      // Get product details
      const configPath = path.join(process.cwd(), "config", "store-config.json");
      const configData = await fs.readFile(configPath, "utf-8");
      const config: StoreConfig = JSON.parse(configData);
      
      const product = config.products.find(p => p.id === orderData.productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const storageOption = product.storageOptions.find(s => s.capacity === orderData.storage);
      if (!storageOption) {
        return res.status(404).json({ error: "Storage option not found" });
      }

      // Calculate amounts
      const fullPrice = storageOption.price;
      const paidAmount = orderData.paymentType === "full" 
        ? fullPrice 
        : config.paymentConfig.defaultAdvancePayment;
      const remainingBalance = fullPrice - paidAmount;

      // Create order
      const order = await storage.createOrder({
        ...orderData,
        productName: product.displayName,
        fullPrice,
        paidAmount,
        remainingBalance,
        paymentScreenshot: req.file.filename,
      });

      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid order data", details: error.errors });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Get order by ID
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  // Get all orders (for admin use)
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
