import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { PhoneGallery } from "@/components/PhoneGallery";
import { HeroSection } from "@/components/HeroSection";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Product } from "@shared/schema";

export default function HomePage() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      
      <section className="px-4 py-6">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6" data-testid="tabs-list">
            <TabsTrigger value="products" data-testid="tab-products">
              Shop Now
            </TabsTrigger>
            <TabsTrigger value="catalog" data-testid="tab-catalog">
              iPhone Catalog
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" data-testid="content-products">
            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="h-12 w-12 animate-spin text-primary" data-testid="loader-products" />
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
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
          </TabsContent>

          <TabsContent value="catalog" data-testid="content-catalog">
            <PhoneGallery />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
