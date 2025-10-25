import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { HeroSection } from "@/components/HeroSection";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@shared/schema";

export default function HomePage() {
  const { data: products, isLoading, error, refetch } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const sortedProducts = products?.slice().sort((a, b) => {
    const getModelNumber = (name: string) => {
      const match = name.match(/iPhone\s+(\d+)/);
      return match ? parseInt(match[1]) : 0;
    };
    
    const modelA = getModelNumber(a.deviceName);
    const modelB = getModelNumber(b.deviceName);
    
    if (modelA !== modelB) {
      return modelB - modelA;
    }
    
    const isPro = (name: string) => name.toLowerCase().includes('pro');
    const isProMax = (name: string) => name.toLowerCase().includes('pro max');
    
    if (isProMax(a.deviceName) && !isProMax(b.deviceName)) return -1;
    if (!isProMax(a.deviceName) && isProMax(b.deviceName)) return 1;
    if (isPro(a.deviceName) && !isPro(b.deviceName)) return -1;
    if (!isPro(a.deviceName) && isPro(b.deviceName)) return 1;
    
    return 0;
  });

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      
      <section className="px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" data-testid="loader-products" />
            <p className="text-muted-foreground text-sm">Loading products...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-6 max-w-md mx-auto">
            <div className="rounded-full bg-destructive/10 p-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold" data-testid="text-error-title">
                Failed to load products
              </h3>
              <p className="text-muted-foreground" data-testid="text-error-message">
                We couldn't load the products. Please check your connection and try again.
              </p>
            </div>
            <Button
              onClick={() => refetch()}
              data-testid="button-retry"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {sortedProducts?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!isLoading && !error && (!products || products.length === 0) && (
          <div className="text-center py-24">
            <p className="text-muted-foreground text-lg" data-testid="text-no-products">
              No products available at the moment.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
