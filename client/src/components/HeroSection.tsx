import { Button } from "@/components/ui/button";
import heroImage from "@assets/generated_images/Premium_iPhones_lifestyle_hero_shot_36227ba3.png";

export function HeroSection() {
  const scrollToProducts = () => {
    window.scrollTo({
      top: window.innerHeight * 0.7,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
      </div>

      <div className="relative h-full flex items-center justify-center px-4">
        <div className="text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            Premium iPhones.
            <br />
            Delivered Across India.
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto font-medium">
            iPhone 13 to iPhone 17. Authentic. Affordable. 
            Pay full price or just ₹550 advance.
          </p>
          <Button
            size="lg"
            onClick={scrollToProducts}
            className="rounded-full px-8 py-6 text-base font-medium shadow-2xl hover:shadow-xl transition-all duration-300 backdrop-blur-md bg-white/20 hover:bg-white/30 border border-white/30 text-white"
            data-testid="button-explore-collection"
          >
            <span className="material-icons mr-2 text-xl">arrow_downward</span>
            Explore Collection
          </Button>
        </div>
      </div>
    </section>
  );
}
