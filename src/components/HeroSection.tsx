import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, Tractor } from "lucide-react";
import heroImg from "@/assets/hero-equipment.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Indian farming landscape at golden hour"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto flex min-h-[85vh] items-center px-4">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/20 px-4 py-1.5 text-sm text-primary-foreground backdrop-blur-sm">
            <Tractor className="h-4 w-4" />
            India's Agricultural Equipment Marketplace
          </div>

          <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight text-primary-foreground sm:text-5xl lg:text-6xl">
            Rent Farm Equipment.{" "}
            <span className="text-gradient-gold">Save Costs.</span>{" "}
            Grow More.
          </h1>

          <p className="mt-6 max-w-lg text-lg text-primary-foreground/80">
            Connect with nearby equipment owners in your village or district.
            Affordable tractor, harvester & rotavator rentals — just like booking a ride.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/browse">
              <Button variant="hero" size="lg" className="text-base">
                <Search className="h-5 w-5" />
                Find Equipment
              </Button>
            </Link>
            <Link to="/list-equipment">
              <Button
                variant="outline"
                size="lg"
                className="border-primary-foreground/30 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                List Your Equipment
              </Button>
            </Link>
          </div>

          <div className="mt-10 flex gap-8">
            {[
              { num: "500+", label: "Equipment Listed" },
              { num: "200+", label: "Villages Connected" },
              { num: "1000+", label: "Farmers Helped" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-2xl font-bold text-secondary">{stat.num}</p>
                <p className="text-xs text-primary-foreground/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
