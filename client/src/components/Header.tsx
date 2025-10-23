import { Link } from "wouter";
import { Menu, Search, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/assets_task_01k897y00cej4bw0xjk1p17he7_1761246962_img_0_1761249465607.webp";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="px-4 h-14 flex items-center justify-between gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          className="flex-shrink-0"
          data-testid="button-menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" data-testid="link-home">
          <img src={logoImage} alt="OnlyIphones" className="h-8 w-auto" />
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
            data-testid="button-user"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
