import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CartItem, StoreConfig } from "@shared/schema";

interface OrderSummaryProps {
  cartItems: CartItem[];
  config: StoreConfig;
  advancePayment: number;
}

export function OrderSummary({ cartItems, config, advancePayment }: OrderSummaryProps) {
  const calculateTotals = () => {
    let subtotal = 0;
    let itemsCount = 0;
    
    cartItems.forEach(item => {
      const product = config.products.find(p => p.id === item.productId);
      const storageOption = product?.storageOptions.find(s => s.capacity === item.storage);
      if (product && storageOption) {
        subtotal += storageOption.price * item.quantity;
        itemsCount += item.quantity;
      }
    });
    
    return { subtotal, itemsCount };
  };

  const { subtotal, itemsCount } = calculateTotals();

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
          {cartItems.map((item) => {
            const product = config.products.find(p => p.id === item.productId);
            const storageOption = product?.storageOptions.find(s => s.capacity === item.storage);
            
            if (!product || !storageOption) return null;
            
            return (
              <div key={item.id} className="text-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-medium line-clamp-1" data-testid={`text-summary-product-${item.id}`}>
                    {product.displayName}
                  </span>
                  <span className="font-medium ml-2">×{item.quantity}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{item.storage}</span>
                  <span data-testid={`text-summary-price-${item.id}`}>
                    ₹{(storageOption.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Items ({itemsCount}):</span>
            <span className="font-medium" data-testid="text-summary-items">
              {itemsCount}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="font-medium" data-testid="text-summary-subtotal">
              ₹{subtotal.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Min. Advance (per item):</span>
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
