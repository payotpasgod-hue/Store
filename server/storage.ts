import { type Order, type CartItem } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private orders: Map<string, Order>;
  private ordersFilePath: string;
  private cartItems: Map<string, CartItem>;
  private cartFilePath: string;

  constructor() {
    this.orders = new Map();
    this.ordersFilePath = path.join(process.cwd(), "data", "orders.json");
    this.cartItems = new Map();
    this.cartFilePath = path.join(process.cwd(), "data", "cart.json");
    this.loadOrders();
    this.loadCart();
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
}

export const storage = new MemStorage();
