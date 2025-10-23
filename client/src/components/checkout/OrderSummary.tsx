import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Product } from "@shared/schema";

interface OrderSummaryProps {
  product: Product;
  storage: { capacity: string; price: number };
  advancePayment: number;
}

export function OrderSummary({ product, storage, advancePayment }: OrderSummaryProps) {
  return (
    <Card className="rounded-2xl sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="material-icons text-primary">receipt</span>
          Order Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-1" data-testid="text-summary-product">
            {product.displayName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {storage.capacity} | {product.model}
          </p>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Full Price:</span>
            <span className="font-medium" data-testid="text-summary-full-price">
              ₹{storage.price.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Advance Option:</span>
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
