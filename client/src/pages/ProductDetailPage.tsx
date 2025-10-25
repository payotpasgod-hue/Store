import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { Product, StoreConfig } from "@shared/schema";
import { Star, Shield, ArrowLeft, Check } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: ["/api/products", id],
  });

  const { data: config, isLoading: configLoading } = useQuery<StoreConfig>({
    queryKey: ["/api/config"],
  });

  const [selectedStorage, setSelectedStorage] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

  // Initialize defaults when product loads
  useEffect(() => {
    if (product && !selectedStorage && product.storageOptions.length > 0) {
      setSelectedStorage(product.storageOptions[0].capacity);
    }
    if (product && !selectedColor && product.colorOptions && product.colorOptions.length > 0) {
      setSelectedColor(product.colorOptions[0]);
    }
  }, [product, selectedStorage, selectedColor]);

  if (productLoading || configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" data-testid="loader-product-detail" />
      </div>
    );
  }

  if (!product || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-4">Product not found</p>
          <Button onClick={() => navigate("/")} data-testid="button-back-home">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const storageOption = product.storageOptions.find(s => s.capacity === selectedStorage) || product.storageOptions[0];

  const handleBuyNow = () => {
    const queryParams = new URLSearchParams({
      productId: product.id,
      productName: product.displayName,
      storage: selectedStorage,
      fullPrice: storageOption.price.toString(),
      ...(selectedColor && { color: selectedColor }),
    });
    navigate(`/checkout?${queryParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square bg-gradient-to-br from-muted/20 to-muted/5">
                  {product.rating && (
                    <Badge 
                      className="absolute top-4 right-4 bg-background text-foreground font-medium gap-0.5 z-10"
                      data-testid="badge-product-rating"
                    >
                      <Star className="h-3 w-3 fill-current text-[#FF9500]" />
                      {product.rating}
                    </Badge>
                  )}
                  
                  <div className="w-full h-full flex items-center justify-center p-8">
                    {product.imagePath ? (
                      <img
                        src={product.imagePath}
                        alt={product.displayName}
                        className="w-full h-full object-contain"
                        data-testid="img-product-detail"
                      />
                    ) : (
                      <div className="text-center">
                        <span className="material-icons text-8xl text-muted-foreground">smartphone</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-5 w-5 text-[#FF9500]" />
                  <span className="font-medium">FREE 1 Year Warranty Included</span>
                </div>
                <Separator />
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>✓ 100% Authentic Products</p>
                  <p>✓ Easy Returns & Exchange</p>
                  <p>✓ Secure Payment Options</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="text-product-name">
                {product.displayName}
              </h1>
              <p className="text-muted-foreground" data-testid="text-product-model">
                Model: {product.model}
              </p>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-[#22C55E]" data-testid="text-product-price">
                ₹{storageOption.price.toLocaleString("en-IN")}
              </span>
              {storageOption.originalPrice && (
                <span className="text-xl text-muted-foreground line-through" data-testid="text-product-original-price">
                  ₹{storageOption.originalPrice.toLocaleString("en-IN")}
                </span>
              )}
              {storageOption.discount && (
                <Badge 
                  className="bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20 font-semibold border-0"
                  data-testid="badge-product-discount"
                >
                  -{storageOption.discount}% OFF
                </Badge>
              )}
            </div>

            {product.storageOptions.length > 1 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Storage</label>
                <Select value={selectedStorage} onValueChange={setSelectedStorage}>
                  <SelectTrigger data-testid="select-storage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {product.storageOptions.map((option) => (
                      <SelectItem 
                        key={option.capacity} 
                        value={option.capacity}
                        data-testid={`option-storage-${option.capacity}`}
                      >
                        <div className="flex items-center justify-between w-full gap-4">
                          <span>{option.capacity}</span>
                          <span className="font-semibold text-[#22C55E]">
                            ₹{option.price.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {product.colorOptions && product.colorOptions.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <div className="flex flex-wrap gap-2">
                  {product.colorOptions.map((color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? "default" : "outline"}
                      onClick={() => setSelectedColor(color)}
                      className="min-w-24"
                      data-testid={`button-color-${color}`}
                    >
                      {selectedColor === color && <Check className="h-4 w-4 mr-1" />}
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Button 
              size="lg" 
              className="w-full rounded-full text-lg"
              onClick={handleBuyNow}
              data-testid="button-buy-now"
            >
              Buy Now
            </Button>

            {product.specs && product.specs.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Specifications</h3>
                  <div className="space-y-3">
                    {product.specs.map((spec, index) => (
                      <div 
                        key={index} 
                        className="flex items-start gap-2 text-sm"
                        data-testid={`text-spec-${index}`}
                      >
                        <Check className="h-4 w-4 text-[#22C55E] mt-0.5 flex-shrink-0" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {product.releaseDate && (
              <p className="text-sm text-muted-foreground" data-testid="text-release-date">
                Released: {product.releaseDate}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
