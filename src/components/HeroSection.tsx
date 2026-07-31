import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, Tractor } from "lucide-react";
import heroImg from "@/assets/hero-equipment.jpg";
import { useLang } from "@/lib/i18n";

const HeroSection = () => {
  const { t } = useLang();

  return (
    <section className="relative min-h-[85vh] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Indian farming landscape at golden hour"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto flex min-h-[85vh] items-center px-4 py-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/20 px-4 py-1.5 text-sm text-primary-foreground backdrop-blur-sm">
            <Tractor className="h-4 w-4" />
            {t("hero.badge")}
          </div>

          <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight text-primary-foreground sm:text-5xl lg:text-6xl">
            {t("hero.title1")} <span className="text-gradient-gold">{t("hero.title2")}</span>{" "}
            {t("hero.title3")}
          </h1>

          <p className="mt-5 max-w-xl font-display text-lg font-semibold text-secondary sm:text-xl">
            {t("hero.tagline")}
          </p>

          <p className="mt-4 max-w-lg text-base text-primary-foreground/80">{t("hero.sub")}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/browse">
              <Button variant="hero" size="lg" className="text-base">
                <Search className="h-5 w-5" />
                {t("hero.cta1")}
              </Button>
            </Link>
            <Link to="/list-equipment">
              <Button
                variant="outline"
                size="lg"
                className="border-primary-foreground/40 bg-transparent text-base text-primary-foreground backdrop-blur-sm hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                {t("hero.cta2")}
              </Button>
            </Link>
          </div>

          <div className="mt-10 flex gap-8">
            {[
              { num: "500+", label: t("hero.stat1") },
              { num: "200+", label: t("hero.stat2") },
              { num: "1000+", label: t("hero.stat3") },
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
