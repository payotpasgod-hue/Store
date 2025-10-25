import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { StoreConfig } from "@shared/schema";

interface OrderSummaryProps {
  orderItem: {
    productId: string;
    productName: string;
    storage: string;
    color: string | null;
    fullPrice: number;
  };
  config: StoreConfig;
  advancePayment: number;
}

export function OrderSummary({ orderItem, config, advancePayment }: OrderSummaryProps) {
  const fullPrice = orderItem.fullPrice;

  return (
    <Card className="rounded-2xl sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="material-icons text-primary">receipt</span>
          Order Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="text-sm">
            <div className="flex justify-between mb-1">
              <span className="font-medium line-clamp-2" data-testid="text-summary-product">
                {orderItem.productName}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>{orderItem.color ? `${orderItem.color}, ${orderItem.storage}` : orderItem.storage}</span>
              <span data-testid="text-summary-price">
                ₹{fullPrice.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-medium" data-testid="text-summary-subtotal">
              ₹{fullPrice.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Min. Advance:</span>
            <span className="font-medium" data-testid="text-summary-advance">
              ₹{advancePayment.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <Separator />

        <div className="bg-primary/5 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-2">
            <span className="material-icons text-primary text-sm mt-0.5">local_shipping</span>
            <div>
              <p className="text-sm font-medium">Free Delivery</p>
              <p className="text-xs text-muted-foreground">Across India</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="material-icons text-primary text-sm mt-0.5">verified</span>
            <div>
              <p className="text-sm font-medium">100% Authentic</p>
              <p className="text-xs text-muted-foreground">Guaranteed genuine product</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
