import { type Order } from "@shared/schema";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

export interface IStorage {
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: Omit<Order, "id" | "createdAt">): Promise<Order>;
  getAllOrders(): Promise<Order[]>;
}

export class MemStorage implements IStorage {
  private orders: Map<string, Order>;
  private ordersFilePath: string;

  constructor() {
    this.orders = new Map();
    this.ordersFilePath = path.join(process.cwd(), "data", "orders.json");
    this.loadOrders();
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

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
}

export const storage = new MemStorage();
