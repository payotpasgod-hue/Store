import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import type { Product, MobileDeviceImage } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [, setLocation] = useLocation();
  const [selectedStorage, setSelectedStorage] = useState(product.storageOptions[0]);

  const { data: deviceImage, isLoading } = useQuery<MobileDeviceImage>({
    queryKey: ["/api/device-image", product.deviceName],
  });

  const handleBuyNow = () => {
    setLocation(`/checkout?product=${product.id}&storage=${selectedStorage.capacity}`);
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover-elevate rounded-2xl">
      <CardContent className="p-0">
        <div className="aspect-[3/4] bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center overflow-hidden">
          {isLoading ? (
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" data-testid={`loader-image-${product.id}`} />
          ) : deviceImage?.data?.image ? (
            <img
              src={deviceImage.data.image}
              alt={product.displayName}
              className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500"
              data-testid={`img-product-${product.id}`}
            />
          ) : (
            <div className="text-center p-8">
              <span className="material-icons text-6xl text-muted-foreground mb-2">smartphone</span>
              <p className="text-sm text-muted-foreground">{product.displayName}</p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-4 p-6">
        <div className="w-full">
          <h3 className="text-xl font-semibold mb-1" data-testid={`text-name-${product.id}`}>
            {product.displayName}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">{product.model}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {product.storageOptions.map((option) => (
              <Badge
                key={option.capacity}
                variant={selectedStorage.capacity === option.capacity ? "default" : "outline"}
                className="cursor-pointer px-3 py-1 hover-elevate"
                onClick={() => setSelectedStorage(option)}
                data-testid={`badge-storage-${product.id}-${option.capacity}`}
              >
                {option.capacity}
              </Badge>
            ))}
          </div>

          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold" data-testid={`text-price-${product.id}`}>
              ₹{selectedStorage.price.toLocaleString("en-IN")}
            </span>
            <span className="text-sm text-muted-foreground">or ₹550 advance</span>
          </div>
        </div>

        <Button
          className="w-full rounded-full"
          size="lg"
          onClick={handleBuyNow}
          data-testid={`button-buy-${product.id}`}
        >
          <span className="material-icons mr-2 text-lg">shopping_cart</span>
          Buy Now
        </Button>
      </CardFooter>
    </Card>
  );
}
