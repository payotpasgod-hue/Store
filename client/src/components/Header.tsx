import { Link } from "wouter";
import { Menu, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/attached_assets/IMG-20251025-WA0000-removebg-preview.png";

export function Header() {
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
          <img src={logoImage} alt="OnlyIphones" className="h-24 w-auto" />
        </Link>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="icon"
            data-testid="button-wishlist"
          >
            <Heart className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
