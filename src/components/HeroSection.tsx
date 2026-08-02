import { Link } from "react-router-dom";
import { ArrowRight, Search, Tractor, CloudSun, Sparkles, PawPrint, Newspaper, Users } from "lucide-react";
import { useLang } from "@/lib/i18n";
import equipmentImg from "@/assets/Equipmnet.jpg.asset.json";
import aiImg from "@/assets/AI.webp.asset.json";
import weatherImg from "@/assets/wether.webp.asset.json";
import livestockImg from "@/assets/live_stack.webp.asset.json";
import newsImg from "@/assets/farmer_news_update.jpg.asset.json";

const cards = [
  { key: "c1", icon: Tractor, to: "/browse", img: equipmentImg.url, tint: "bg-tint-1 text-tint-1-foreground", chip: "bg-tint-1-foreground/15" },
  { key: "c2", icon: Search, to: "/list-equipment", img: equipmentImg.url, tint: "bg-tint-2 text-tint-2-foreground", chip: "bg-tint-2-foreground/10" },
  { key: "c3", icon: Sparkles, to: "/#features", img: aiImg.url, tint: "bg-tint-3 text-tint-3-foreground", chip: "bg-tint-3-foreground/10" },
  { key: "c4", icon: CloudSun, to: "/#features", img: weatherImg.url, tint: "bg-tint-4 text-tint-4-foreground", chip: "bg-tint-4-foreground/10" },
  { key: "c5", icon: PawPrint, to: "/#features", img: livestockImg.url, tint: "bg-tint-5 text-tint-5-foreground", chip: "bg-tint-5-foreground/10" },
  { key: "c6", icon: Newspaper, to: "/#features", img: newsImg.url, tint: "bg-tint-6 text-tint-6-foreground", chip: "bg-tint-6-foreground/10" },
];


const HeroSection = () => {
  const { t } = useLang();

  return (
    <section className="relative overflow-hidden bg-band-soft">
      <div className="absolute inset-0 bg-[image:var(--gradient-band)]" />

      <div className="container relative mx-auto px-4 py-10 sm:py-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-band px-4 py-1.5 text-xs font-semibold text-band-foreground sm:text-sm">
            <Tractor className="h-4 w-4" />
            {t("hero.badge")}
          </div>

          <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            {t("hero.title1")} <span className="text-band">{t("hero.title2")}</span> {t("hero.title3")}
          </h1>

          <p className="mt-4 max-w-2xl font-display text-base font-semibold text-band sm:text-lg">
            {t("hero.tagline")}
          </p>
          <p className="mt-3 max-w-2xl text-sm text-foreground/70 sm:text-base">{t("hero.sub")}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 rounded-md bg-band px-5 py-3 text-sm font-bold text-band-foreground shadow-card transition hover:opacity-90"
            >
              <Search className="h-4 w-4" /> {t("hero.cta1")}
            </Link>
            <Link
              to="/list-equipment"
              className="inline-flex items-center gap-2 rounded-md bg-secondary px-5 py-3 text-sm font-bold text-secondary-foreground shadow-card transition hover:opacity-90"
            >
              {t("hero.cta2")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Quick action cards */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {cards.map((card) => (
            <Link
              key={card.key}
              to={card.to}
              className={`group flex flex-col overflow-hidden rounded-xl shadow-card transition hover:-translate-y-1 hover:shadow-elevated ${card.tint}`}
            >
              <div className="relative h-28 overflow-hidden">
                <img
                  src={card.img}
                  alt={t(`hero.${card.key}.t`)}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
                <span
                  className={`absolute -bottom-5 left-4 flex h-11 w-11 items-center justify-center rounded-full border-2 border-background shadow-card ${card.tint}`}
                >
                  <card.icon className="h-5 w-5" />
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5 pt-7">
                <h2 className="font-display text-base font-bold leading-snug">
                  {t(`hero.${card.key}.t`)}
                </h2>
                <p className="mt-2 text-xs leading-relaxed opacity-80">{t(`hero.${card.key}.d`)}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold">
                  {t("hero.explore")}
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}

        </div>

        {/* Stats strip */}
        <div className="mt-10 grid gap-4 rounded-xl bg-background/80 p-6 backdrop-blur-sm sm:grid-cols-3">
          {[
            { num: "500+", label: t("hero.stat1"), icon: Tractor },
            { num: "200+", label: t("hero.stat2"), icon: Users },
            { num: "1000+", label: t("hero.stat3"), icon: Sparkles },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <stat.icon className="h-6 w-6 text-band" />
              <div>
                <p className="font-display text-2xl font-bold text-band">{stat.num}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
