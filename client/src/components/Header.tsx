import { Link } from "wouter";

export function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/90 border-b">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <a className="flex items-center gap-2 hover:opacity-80 transition-opacity" data-testid="link-home">
            <span className="material-icons text-primary text-2xl">smartphone</span>
            <span className="font-bold text-xl tracking-tight">onlyiphones.store</span>
          </a>
        </Link>

        <div className="flex items-center gap-2">
          <span className="material-icons text-muted-foreground">location_on</span>
          <span className="text-sm font-medium text-muted-foreground hidden sm:inline">India Only</span>
        </div>
      </div>
    </header>
  );
}
