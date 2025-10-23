import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Menu, Search, Heart, User, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CartItem } from "@shared/schema";
import logoImage from "@assets/assets_task_01k897y00cej4bw0xjk1p17he7_1761246962_img_0_1761249465607.webp";

export function Header() {
  const [, navigate] = useLocation();
  
  const { data: cartItems } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
  });
  
  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="px-4 h-20 flex items-center justify-between gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          className="flex-shrink-0"
          data-testid="button-menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" data-testid="link-home">
          <img src={logoImage} alt="OnlyIphones" className="h-16 w-auto" />
        </Link>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="icon"
            data-testid="button-search"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            data-testid="button-wishlist"
          >
            <Heart className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/cart")}
            className="relative"
            data-testid="button-cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground"
                data-testid="badge-cart-count"
              >
                {cartCount}
              </Badge>
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            data-testid="button-user"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
