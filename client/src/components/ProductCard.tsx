import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Product } from "@shared/schema";
import { Star, Shield, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [selectedStorage, setSelectedStorage] = useState(product.storageOptions[0].capacity);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/cart", {
        productId: product.id,
        storage: selectedStorage,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to Cart",
        description: `${product.displayName} (${selectedStorage}) has been added to your cart.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCartMutation.mutate();
  };

  const storageOption = product.storageOptions.find(s => s.capacity === selectedStorage) || product.storageOptions[0];

  return (
    <Card 
      className="overflow-hidden hover-elevate active-elevate-2 transition-all" 
      data-testid={`card-product-${product.id}`}
    >
      <CardContent className="p-0">
        <div className="relative aspect-[3/4] bg-gradient-to-br from-muted/20 to-muted/5 flex items-center justify-center overflow-hidden">
          {product.imagePath ? (
            <img
              src={product.imagePath}
              alt={product.displayName}
              className="w-full h-full object-contain object-center p-4"
              data-testid={`img-product-${product.id}`}
            />
          ) : (
            <div className="text-center p-6">
              <span className="material-icons text-5xl text-muted-foreground mb-2">smartphone</span>
            </div>
          )}
          
          {product.rating && (
            <Badge 
              className="absolute top-2 right-2 bg-background text-foreground font-medium gap-0.5"
              data-testid={`badge-rating-${product.id}`}
            >
              {product.rating}
              <Star className="h-3 w-3 fill-current text-[#FF9500]" />
            </Badge>
          )}
        </div>

        <div className="p-3 space-y-3">
          <h3 className="text-sm font-semibold leading-tight line-clamp-2" data-testid={`text-name-${product.id}`}>
            {product.displayName}
          </h3>
          
          {product.storageOptions.length > 1 && (
            <Select value={selectedStorage} onValueChange={setSelectedStorage}>
              <SelectTrigger 
                className="w-full h-8"
                data-testid={`select-storage-${product.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {product.storageOptions.map((option) => (
                  <SelectItem 
                    key={option.capacity} 
                    value={option.capacity}
                    data-testid={`option-storage-${product.id}-${option.capacity}`}
                  >
                    {option.capacity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[#22C55E]" data-testid={`text-price-${product.id}`}>
              ₹{storageOption.price.toLocaleString("en-IN")}
            </span>
            {storageOption.originalPrice && (
              <span className="text-xs text-muted-foreground line-through" data-testid={`text-original-price-${product.id}`}>
                ₹{storageOption.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground" data-testid={`text-warranty-${product.id}`}>
            <Shield className="h-3.5 w-3.5 text-[#FF9500]" />
            <span className="font-medium">FREE 1 Year Warranty</span>
          </div>

          {storageOption.discount && (
            <Badge 
              className="bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20 font-semibold border-0"
              data-testid={`badge-discount-${product.id}`}
            >
              -{storageOption.discount}% OFF
            </Badge>
          )}

          <Button 
            className="w-full rounded-full"
            size="sm"
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
            data-testid={`button-add-to-cart-${product.id}`}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
