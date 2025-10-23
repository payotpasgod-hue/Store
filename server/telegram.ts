import type { Order } from "@shared/schema";

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
    
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Telegram API error:", error);
      return false;
    }

    console.log("Order notification sent to Telegram successfully");
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
    
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Telegram API error:", error);
      return false;
    }

    console.log("Batch order notification sent to Telegram successfully");
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
• Screenshot: ${escapeHtml(order.paymentScreenshot)}

<b>Order Date:</b> ${new Date(order.createdAt).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short'
  })}

<b>Order ID:</b> ${escapeHtml(order.id)}

---
Please verify the payment screenshot and process the order.
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
• Screenshot: ${escapeHtml(firstOrder.paymentScreenshot)}

<b>Order Date:</b> ${new Date(firstOrder.createdAt).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short'
  })}

<b>Order IDs:</b>
${orders.map(o => escapeHtml(o.id)).join(', ')}

---
Please verify the payment screenshot and process the orders.
`.trim();
}
