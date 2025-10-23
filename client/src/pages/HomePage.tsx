import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { HeroSection } from "@/components/HeroSection";
import { Loader2 } from "lucide-react";
import type { Product } from "@shared/schema";

export default function HomePage() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Explore Our Collection
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Authentic iPhones from iPhone 13 to iPhone 17. Choose your perfect device with flexible payment options.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-12 w-12 animate-spin text-primary" data-testid="loader-products" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!isLoading && (!products || products.length === 0) && (
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
