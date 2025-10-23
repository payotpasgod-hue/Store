import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import type { Product } from "@shared/schema";
import { Star, Shield } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [, setLocation] = useLocation();
  const [selectedStorage] = useState(product.storageOptions[0]);

  const handleCardClick = () => {
    setLocation(`/checkout?product=${product.id}&storage=${selectedStorage.capacity}`);
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover-elevate active-elevate-2 transition-all" 
      onClick={handleCardClick}
      data-testid={`card-product-${product.id}`}
    >
      <CardContent className="p-0">
        <div className="relative aspect-[3/4] bg-gradient-to-br from-muted/20 to-muted/5 flex items-center justify-center">
          {product.imagePath ? (
            <img
              src={product.imagePath}
              alt={product.displayName}
              className="w-full h-full object-contain p-6"
              data-testid={`img-product-${product.id}`}
            />
          ) : (
            <div className="text-center p-6">
              <span className="material-icons text-5xl text-muted-foreground mb-2">smartphone</span>
            </div>
          )}
          
          {selectedStorage.discount && (
            <Badge 
              className="absolute top-2 left-2 bg-background text-foreground font-semibold"
              data-testid={`badge-discount-${product.id}`}
            >
              -{selectedStorage.discount}% OFF
            </Badge>
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

        <div className="p-3 space-y-2">
          <h3 className="text-sm font-semibold leading-tight line-clamp-2" data-testid={`text-name-${product.id}`}>
            {product.displayName}
          </h3>
          
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[#22C55E]" data-testid={`text-price-${product.id}`}>
              ₹{selectedStorage.price.toLocaleString("en-IN")}
            </span>
            {selectedStorage.originalPrice && (
              <span className="text-xs text-muted-foreground line-through" data-testid={`text-original-price-${product.id}`}>
                ₹{selectedStorage.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground" data-testid={`text-warranty-${product.id}`}>
            <Shield className="h-3.5 w-3.5 text-[#FF9500]" />
            <span className="font-medium">FREE 1 Year Warranty</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
