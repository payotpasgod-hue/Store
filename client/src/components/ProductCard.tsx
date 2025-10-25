import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@shared/schema";
import { Star, Shield, Eye } from "lucide-react";
import { useLocation } from "wouter";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [, navigate] = useLocation();
  const storageOption = product.storageOptions[0];

  const handleViewProduct = () => {
    navigate(`/products/${product.id}`);
  };

  return (
    <Card 
      className="overflow-hidden hover-elevate active-elevate-2 transition-all cursor-pointer" 
      data-testid={`card-product-${product.id}`}
      onClick={handleViewProduct}
    >
      <CardContent className="p-0">
        <div className="relative aspect-[3/4] bg-gradient-to-br from-muted/20 to-muted/5 overflow-hidden">
          {product.rating && (
            <Badge 
              className="absolute top-2 right-2 bg-background text-foreground font-medium gap-0.5 z-10"
              data-testid={`badge-rating-${product.id}`}
            >
              <Star className="h-3 w-3 fill-current text-[#FF9500]" />
              {product.rating}
            </Badge>
          )}
          
          <div className="w-full h-full flex items-center justify-center">
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
          </div>
        </div>

        <div className="p-3 space-y-3">
          <h3 className="text-sm font-semibold leading-tight line-clamp-2" data-testid={`text-name-${product.id}`}>
            {product.displayName}
          </h3>
          
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
            onClick={handleViewProduct}
            data-testid={`button-view-product-${product.id}`}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
