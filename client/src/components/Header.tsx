import { Link } from "wouter";
import { Menu, Search, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";

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

        <Link href="/" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity" data-testid="link-home">
          <div className="relative w-7 h-7 flex items-center justify-center">
            <div className="absolute w-6 h-6 border-[3px] border-[#FF9500] rounded-full" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }} />
            <div className="absolute w-6 h-6 border-[3px] border-transparent rounded-full" style={{ clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)' }} />
          </div>
          <span className="font-bold text-lg tracking-tight">OVANTICA</span>
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
