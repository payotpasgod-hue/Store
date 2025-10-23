import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Order } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function OrderConfirmationPage() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const orderId = searchParams.get("orderId");

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: orderId ? [`/api/orders/${orderId}`] : [],
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" data-testid="loader-order" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Order not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
            <span className="material-icons text-5xl text-green-600 dark:text-green-500">check_circle</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your order. We'll contact you shortly.
          </p>
        </div>

        <Card className="rounded-2xl mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="material-icons text-primary">receipt_long</span>
              Order Details
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Order ID</p>
              <p className="font-mono font-semibold text-lg" data-testid="text-order-id">
                {order.id}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Customer Name</p>
                <p className="font-medium" data-testid="text-customer-name">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Mobile Number</p>
                <p className="font-medium" data-testid="text-phone">{order.phone}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Delivery Address</p>
              <p className="font-medium" data-testid="text-address">{order.address}</p>
              <p className="text-sm text-muted-foreground mt-1">PIN: {order.pinCode}</p>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground mb-1">Product</p>
              <p className="font-semibold text-lg" data-testid="text-product-name">
                {order.productName} - {order.storage}
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Full Price:</span>
                <span className="font-medium" data-testid="text-full-price">
                  ₹{order.fullPrice.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid Amount:</span>
                <span className="font-semibold text-green-600 dark:text-green-500" data-testid="text-paid-amount">
                  ₹{order.paidAmount.toLocaleString("en-IN")}
                </span>
              </div>
              {order.remainingBalance > 0 && (
                <div className="flex justify-between text-lg">
                  <span className="font-medium">Balance on Delivery:</span>
                  <span className="font-bold text-primary" data-testid="text-balance">
                    ₹{order.remainingBalance.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="material-icons text-primary">info</span>
              Next Steps
            </CardTitle>
          </CardHeader>

          <CardContent>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium">Order Verification</p>
                  <p className="text-sm text-muted-foreground">
                    We'll verify your payment and contact you within 24 hours
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium">Shipping Confirmation</p>
                  <p className="text-sm text-muted-foreground">
                    You'll receive shipping details via phone call/SMS
                  </p>
                </div>
              </li>
              {order.remainingBalance > 0 && (
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Pay on Delivery</p>
                    <p className="text-sm text-muted-foreground">
                      Pay the remaining ₹{order.remainingBalance.toLocaleString("en-IN")} when you receive your iPhone
                    </p>
                  </div>
                </li>
              )}
            </ol>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            size="lg"
            onClick={() => navigate("/")}
            className="rounded-full"
            data-testid="button-continue-shopping"
          >
            <span className="material-icons mr-2">home</span>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
