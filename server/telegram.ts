import type { Order } from "@shared/schema";
import fs from "fs";
import path from "path";
import { FormData, File } from "formdata-node";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Escape HTML special characters for Telegram
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendOrderNotification(order: Order): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error("Telegram credentials not configured");
    return false;
  }

  try {
    const message = formatOrderMessage(order);
    const screenshotPath = path.join(process.cwd(), "uploads", "payment-screenshots", order.paymentScreenshot);
    
    // Check if screenshot file exists
    if (!fs.existsSync(screenshotPath)) {
      console.error("Screenshot file not found:", screenshotPath);
      return false;
    }

    // Read the screenshot file
    const fileBuffer = await fs.promises.readFile(screenshotPath);
    const fileName = order.paymentScreenshot;
    
    // Create FormData and append the photo
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('photo', new File([fileBuffer], fileName, { type: 'image/jpeg' }));
    formData.append('caption', message);
    formData.append('parse_mode', 'HTML');

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
      {
        method: "POST",
        body: formData as any,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Telegram API error:", error);
      return false;
    }

    console.log("Order notification with screenshot sent to Telegram successfully");
    return true;
  } catch (error) {
    console.error("Error sending Telegram notification:", error);
    return false;
  }
}

export async function sendBatchOrderNotification(orders: Order[]): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error("Telegram credentials not configured");
    return false;
  }

  try {
    const message = formatBatchOrderMessage(orders);
    const firstOrder = orders[0];
    const screenshotPath = path.join(process.cwd(), "uploads", "payment-screenshots", firstOrder.paymentScreenshot);
    
    // Check if screenshot file exists
    if (!fs.existsSync(screenshotPath)) {
      console.error("Screenshot file not found:", screenshotPath);
      return false;
    }

    // Read the screenshot file
    const fileBuffer = await fs.promises.readFile(screenshotPath);
    const fileName = firstOrder.paymentScreenshot;
    
    // Create FormData and append the photo
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('photo', new File([fileBuffer], fileName, { type: 'image/jpeg' }));
    formData.append('caption', message);
    formData.append('parse_mode', 'HTML');

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
      {
        method: "POST",
        body: formData as any,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Telegram API error:", error);
      return false;
    }

    console.log("Batch order notification with screenshot sent to Telegram successfully");
    return true;
  } catch (error) {
    console.error("Error sending Telegram notification:", error);
    return false;
  }
}

function formatOrderMessage(order: Order): string {
  const colorInfo = order.color ? `\n<b>Color:</b> ${escapeHtml(order.color)}` : '';
  const balanceInfo = order.remainingBalance > 0 
    ? `\n<b>Remaining Balance:</b> ₹${order.remainingBalance.toLocaleString('en-IN')}`
    : '';

  return `
<b>NEW ORDER RECEIVED</b>

<b>Product Details:</b>
• ${escapeHtml(order.productName)}
• Storage: ${escapeHtml(order.storage)}${colorInfo}

<b>Customer Information:</b>
• Name: ${escapeHtml(order.customerName)}
• Phone: ${escapeHtml(order.phone)}

<b>Delivery Address:</b>
${escapeHtml(order.address)}
PIN Code: ${escapeHtml(order.pinCode)}

<b>Payment Details:</b>
• Full Price: ₹${order.fullPrice.toLocaleString('en-IN')}
• Paid Amount: ₹${order.paidAmount.toLocaleString('en-IN')}${balanceInfo}
• Payment Type: ${order.paymentType === 'full' ? 'Full Payment' : 'Advance Payment'}

<b>Order Date:</b> ${new Date(order.createdAt).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short'
  })}

<b>Order ID:</b> ${escapeHtml(order.id)}

---
Please verify the payment screenshot above and process the order.
`.trim();
}

function formatBatchOrderMessage(orders: Order[]): string {
  if (orders.length === 0) return '';
  
  const firstOrder = orders[0];
  const totalItems = orders.length;
  const totalAmount = orders.reduce((sum, order) => sum + order.paidAmount, 0);
  const totalBalance = orders.reduce((sum, order) => sum + order.remainingBalance, 0);

  let itemsList = orders.map((order, index) => {
    const colorInfo = order.color ? ` (${escapeHtml(order.color)})` : '';
    return `${index + 1}. ${escapeHtml(order.productName)} - ${escapeHtml(order.storage)}${colorInfo}`;
  }).join('\n');

  const balanceInfo = totalBalance > 0 
    ? `\n<b>Total Remaining Balance:</b> ₹${totalBalance.toLocaleString('en-IN')}`
    : '';

  return `
<b>NEW BULK ORDER RECEIVED</b>

<b>Order Summary:</b>
• Total Items: ${totalItems}
${itemsList}

<b>Customer Information:</b>
• Name: ${escapeHtml(firstOrder.customerName)}
• Phone: ${escapeHtml(firstOrder.phone)}

<b>Delivery Address:</b>
${escapeHtml(firstOrder.address)}
PIN Code: ${escapeHtml(firstOrder.pinCode)}

<b>Payment Details:</b>
• Total Paid: ₹${totalAmount.toLocaleString('en-IN')}${balanceInfo}
• Payment Type: ${firstOrder.paymentType === 'full' ? 'Full Payment' : 'Advance Payment'}

<b>Order Date:</b> ${new Date(firstOrder.createdAt).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short'
  })}

<b>Order IDs:</b>
${orders.map(o => escapeHtml(o.id)).join(', ')}

---
Please verify the payment screenshot above and process the orders.
`.trim();
}
