import { type Order, type CartItem, type AdminSettings, type ProductPriceOverride } from "@shared/schema";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

export interface IStorage {
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: Omit<Order, "id" | "createdAt">): Promise<Order>;
  createOrders(orders: Omit<Order, "id" | "createdAt">[]): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  
  getCartItems(): Promise<CartItem[]>;
  addCartItem(item: Omit<CartItem, "id" | "addedAt">): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: string): Promise<boolean>;
  clearCart(): Promise<void>;
  
  getAdminSettings(): Promise<AdminSettings>;
  updateAdminSettings(settings: Partial<Omit<AdminSettings, "id" | "updatedAt">>): Promise<AdminSettings>;
  
  getProductPrices(): Promise<ProductPriceOverride[]>;
  updateProductPrice(override: ProductPriceOverride): Promise<ProductPriceOverride>;
  deleteProductPrice(productId: string, storage: string): Promise<boolean>;
  updateConfigPrice(productId: string, storage: string, price: number, originalPrice?: number, discount?: number): Promise<void>;
  updateConfigUpiId(upiId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private orders: Map<string, Order>;
  private ordersFilePath: string;
  private cartItems: Map<string, CartItem>;
  private cartFilePath: string;
  private adminSettings: AdminSettings | null;
  private adminSettingsFilePath: string;
  private productPrices: Map<string, ProductPriceOverride>;
  private productPricesFilePath: string;

  constructor() {
    this.orders = new Map();
    this.ordersFilePath = path.join(process.cwd(), "data", "orders.json");
    this.cartItems = new Map();
    this.cartFilePath = path.join(process.cwd(), "data", "cart.json");
    this.adminSettings = null;
    this.adminSettingsFilePath = path.join(process.cwd(), "data", "admin-settings.json");
    this.productPrices = new Map();
    this.productPricesFilePath = path.join(process.cwd(), "data", "product-prices.json");
    this.loadOrders();
    this.loadCart();
    this.loadAdminSettings();
    this.loadProductPrices();
  }

  private async loadOrders() {
    try {
      await fs.mkdir(path.dirname(this.ordersFilePath), { recursive: true });
      const data = await fs.readFile(this.ordersFilePath, "utf-8");
      const ordersArray: Order[] = JSON.parse(data);
      ordersArray.forEach(order => this.orders.set(order.id, order));
    } catch (error) {
      // File doesn't exist yet, start with empty orders
      await this.saveOrders();
    }
  }

  private async saveOrders() {
    const ordersArray = Array.from(this.orders.values());
    await fs.writeFile(this.ordersFilePath, JSON.stringify(ordersArray, null, 2));
  }

  private async loadCart() {
    try {
      await fs.mkdir(path.dirname(this.cartFilePath), { recursive: true });
      const data = await fs.readFile(this.cartFilePath, "utf-8");
      const cartArray: CartItem[] = JSON.parse(data);
      cartArray.forEach(item => this.cartItems.set(item.id, item));
    } catch (error) {
      await this.saveCart();
    }
  }

  private async saveCart() {
    const cartArray = Array.from(this.cartItems.values());
    await fs.writeFile(this.cartFilePath, JSON.stringify(cartArray, null, 2));
  }

  private async loadAdminSettings() {
    try {
      await fs.mkdir(path.dirname(this.adminSettingsFilePath), { recursive: true });
      const data = await fs.readFile(this.adminSettingsFilePath, "utf-8");
      this.adminSettings = JSON.parse(data);
    } catch (error) {
      this.adminSettings = {
        id: "default",
        updatedAt: new Date().toISOString(),
      };
      await this.saveAdminSettings();
    }
  }

  private async saveAdminSettings() {
    await fs.writeFile(this.adminSettingsFilePath, JSON.stringify(this.adminSettings, null, 2));
  }

  private async loadProductPrices() {
    try {
      await fs.mkdir(path.dirname(this.productPricesFilePath), { recursive: true });
      const data = await fs.readFile(this.productPricesFilePath, "utf-8");
      const pricesArray: ProductPriceOverride[] = JSON.parse(data);
      pricesArray.forEach(price => {
        const key = `${price.productId}-${price.storage}`;
        this.productPrices.set(key, price);
      });
    } catch (error) {
      await this.saveProductPrices();
    }
  }

  private async saveProductPrices() {
    const pricesArray = Array.from(this.productPrices.values());
    await fs.writeFile(this.productPricesFilePath, JSON.stringify(pricesArray, null, 2));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(orderData: Omit<Order, "id" | "createdAt">): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      ...orderData,
      id,
      createdAt: new Date().toISOString(),
    };
    this.orders.set(id, order);
    await this.saveOrders();
    return order;
  }

  async createOrders(ordersData: Omit<Order, "id" | "createdAt">[]): Promise<Order[]> {
    const createdOrders: Order[] = [];
    const originalOrdersSize = this.orders.size;
    
    try {
      for (const orderData of ordersData) {
        const id = randomUUID();
        const order: Order = {
          ...orderData,
          id,
          createdAt: new Date().toISOString(),
        };
        createdOrders.push(order);
        this.orders.set(id, order);
      }
      
      await this.saveOrders();
      return createdOrders;
    } catch (error) {
      for (const order of createdOrders) {
        this.orders.delete(order.id);
      }
      throw error;
    }
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getCartItems(): Promise<CartItem[]> {
    return Array.from(this.cartItems.values());
  }

  async addCartItem(itemData: Omit<CartItem, "id" | "addedAt">): Promise<CartItem> {
    const existing = Array.from(this.cartItems.values()).find(
      item => item.productId === itemData.productId && 
              item.storage === itemData.storage &&
              item.color === itemData.color
    );

    if (existing) {
      existing.quantity += itemData.quantity;
      this.cartItems.set(existing.id, existing);
      await this.saveCart();
      return existing;
    }

    const id = randomUUID();
    const item: CartItem = {
      ...itemData,
      id,
      addedAt: new Date().toISOString(),
    };
    this.cartItems.set(id, item);
    await this.saveCart();
    return item;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (!item) return undefined;

    item.quantity = quantity;
    this.cartItems.set(id, item);
    await this.saveCart();
    return item;
  }

  async removeCartItem(id: string): Promise<boolean> {
    const deleted = this.cartItems.delete(id);
    if (deleted) {
      await this.saveCart();
    }
    return deleted;
  }

  async clearCart(): Promise<void> {
    this.cartItems.clear();
    await this.saveCart();
  }

  async getAdminSettings(): Promise<AdminSettings> {
    if (!this.adminSettings) {
      this.adminSettings = {
        id: "default",
        updatedAt: new Date().toISOString(),
      };
      await this.saveAdminSettings();
    }
    return this.adminSettings;
  }

  async updateAdminSettings(settings: Partial<Omit<AdminSettings, "id" | "updatedAt">>): Promise<AdminSettings> {
    const current = await this.getAdminSettings();
    this.adminSettings = {
      ...current,
      ...settings,
      id: "default",
      updatedAt: new Date().toISOString(),
    };
    await this.saveAdminSettings();
    return this.adminSettings;
  }

  async getProductPrices(): Promise<ProductPriceOverride[]> {
    return Array.from(this.productPrices.values());
  }

  async updateProductPrice(override: ProductPriceOverride): Promise<ProductPriceOverride> {
    const key = `${override.productId}-${override.storage}`;
    this.productPrices.set(key, override);
    await this.saveProductPrices();
    return override;
  }

  async deleteProductPrice(productId: string, storage: string): Promise<boolean> {
    const key = `${productId}-${storage}`;
    const deleted = this.productPrices.delete(key);
    if (deleted) {
      await this.saveProductPrices();
    }
    return deleted;
  }

  async updateConfigPrice(productId: string, storage: string, price: number, originalPrice?: number, discount?: number): Promise<void> {
    const configPath = path.join(process.cwd(), "config", "store-config.json");
    const configData = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(configData);

    const product = config.products.find((p: any) => p.id === productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const storageOption = product.storageOptions.find((s: any) => s.capacity === storage);
    if (!storageOption) {
      throw new Error("Storage option not found");
    }

    storageOption.price = price;
    if (originalPrice !== undefined) {
      storageOption.originalPrice = originalPrice;
    }
    if (discount !== undefined) {
      storageOption.discount = discount;
    }

    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  }

  async updateConfigUpiId(upiId: string): Promise<void> {
    const configPath = path.join(process.cwd(), "config", "store-config.json");
    const configData = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(configData);

    config.paymentConfig.upiId = upiId;
    const encodedUpiId = encodeURIComponent(upiId);
    config.paymentConfig.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${encodedUpiId}%26pn=OnlyiPhones%26cu=INR`;

    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  }
}

export const storage = new MemStorage();
