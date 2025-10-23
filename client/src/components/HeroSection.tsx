export function HeroSection() {
  return (
    <section className="bg-muted/30 py-6" data-testid="section-hero">
      <div className="px-4">
        <h1 className="text-xl font-semibold mb-3" data-testid="text-hero-title">
          Buy Refurbished IPhones
        </h1>
        <div className="flex gap-3 overflow-x-auto pb-1">
          <button className="text-sm font-medium text-[#FF9500] whitespace-nowrap" data-testid="button-series-iphone15">
            iPhone 15 Series
          </button>
          <span className="text-muted-foreground">|</span>
          <button className="text-sm font-medium text-[#FF9500] whitespace-nowrap" data-testid="button-series-iphonex">
            iPhone X Series
          </button>
          <span className="text-muted-foreground">|</span>
          <button className="text-sm font-medium text-[#FF9500] whitespace-nowrap" data-testid="button-series-iphone11">
            iPhone 11 Se
          </button>
        </div>
      </div>
    </section>
  );
}
