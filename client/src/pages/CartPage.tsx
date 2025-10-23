import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CartItem, Product, StoreConfig } from "@shared/schema";
import { Loader2, Trash2, ShoppingBag, Minus, Plus } from "lucide-react";

export default function CartPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems, isLoading: cartLoading } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
  });

  const { data: config, isLoading: configLoading } = useQuery<StoreConfig>({
    queryKey: ["/api/config"],
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      return apiRequest("PATCH", `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    },
  });

  const handleQuantityChange = (item: CartItem, delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;
    updateQuantityMutation.mutate({ id: item.id, quantity: newQuantity });
  };

  const getProductDetails = (productId: string, storage: string) => {
    const product = config?.products.find(p => p.id === productId);
    const storageOption = product?.storageOptions.find(s => s.capacity === storage);
    return { product, storageOption };
  };

  const calculateTotals = () => {
    if (!cartItems || !config) return { subtotal: 0, total: 0, items: 0 };
    
    let subtotal = 0;
    let items = 0;
    
    cartItems.forEach(item => {
      const { product, storageOption } = getProductDetails(item.productId, item.storage);
      if (product && storageOption) {
        subtotal += storageOption.price * item.quantity;
        items += item.quantity;
      }
    });
    
    return { subtotal, total: subtotal, items };
  };

  const totals = calculateTotals();

  if (cartLoading || configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" data-testid="loader-cart" />
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
          <Card className="rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ShoppingBag className="h-24 w-24 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2" data-testid="text-empty-cart">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Add some products to get started</p>
              <Button onClick={() => navigate("/")} data-testid="button-continue-shopping">
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const { product, storageOption } = getProductDetails(item.productId, item.storage);
              
              if (!product || !storageOption) return null;
              
              return (
                <Card key={item.id} className="rounded-2xl" data-testid={`cart-item-${item.id}`}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-muted/20 to-muted/5 rounded-lg flex items-center justify-center flex-shrink-0">
                        {product.imagePath ? (
                          <img
                            src={product.imagePath}
                            alt={product.displayName}
                            className="w-full h-full object-contain p-2"
                            data-testid={`img-cart-${item.id}`}
                          />
                        ) : (
                          <span className="material-icons text-3xl text-muted-foreground">smartphone</span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1 line-clamp-1" data-testid={`text-cart-product-${item.id}`}>
                          {product.displayName}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {item.storage} | {product.model}
                        </p>
                        
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item, -1)}
                              disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                              data-testid={`button-decrease-${item.id}`}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium" data-testid={`text-quantity-${item.id}`}>
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item, 1)}
                              disabled={updateQuantityMutation.isPending}
                              data-testid={`button-increase-${item.id}`}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-bold text-[#22C55E]" data-testid={`text-price-${item.id}`}>
                              ₹{(storageOption.price * item.quantity).toLocaleString("en-IN")}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeItemMutation.mutate(item.id)}
                              disabled={removeItemMutation.isPending}
                              data-testid={`button-remove-${item.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="lg:col-span-1">
            <Card className="rounded-2xl sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="material-icons text-primary">receipt</span>
                  Order Summary
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items ({totals.items}):</span>
                    <span className="font-medium" data-testid="text-items-count">
                      {totals.items}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium" data-testid="text-subtotal">
                      ₹{totals.subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery:</span>
                    <span className="font-medium text-[#22C55E]">FREE</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between">
                  <span className="font-semibold">Total:</span>
                  <span className="text-xl font-bold text-[#22C55E]" data-testid="text-total">
                    ₹{totals.total.toLocaleString("en-IN")}
                  </span>
                </div>
              </CardContent>
              
              <CardFooter className="flex-col gap-3">
                <Button 
                  className="w-full rounded-full"
                  size="lg"
                  onClick={() => navigate("/checkout")}
                  data-testid="button-checkout"
                >
                  Proceed to Checkout
                </Button>
                <Button 
                  variant="outline"
                  className="w-full rounded-full"
                  size="lg"
                  onClick={() => navigate("/")}
                  data-testid="button-continue-shopping"
                >
                  Continue Shopping
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
