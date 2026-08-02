import { Sparkles, CloudSun, Tractor, Newspaper, Users, PawPrint } from "lucide-react";
import { useLang } from "@/lib/i18n";
import equipmentImg from "@/assets/Equipmnet.jpg.asset.json";
import aiImg from "@/assets/AI.webp.asset.json";
import weatherImg from "@/assets/wether.webp.asset.json";
import livestockImg from "@/assets/live_stack.webp.asset.json";
import newsImg from "@/assets/farmer_news_update.jpg.asset.json";

const features = [
  { icon: Sparkles, key: "f1", live: false, img: aiImg.url },
  { icon: CloudSun, key: "f2", live: false, img: weatherImg.url },
  { icon: Tractor, key: "f3", live: true, img: equipmentImg.url },
  { icon: PawPrint, key: "f4", live: false, img: livestockImg.url },
  { icon: Newspaper, key: "f5", live: false, img: newsImg.url },
  { icon: Users, key: "f6", live: false, img: equipmentImg.url },
];


const PlatformFeatures = () => {
  const { t } = useLang();

  return (
    <section id="features" className="relative overflow-hidden py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

      <div className="container relative mx-auto px-4">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary">
            <Sparkles className="h-4 w-4" />
            {t("plat.badge")}
          </div>
          <h2 className="mx-auto mt-4 max-w-3xl font-display text-3xl font-bold text-foreground sm:text-4xl">
            {t("plat.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{t("plat.sub")}</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.key}
              className="group relative overflow-hidden rounded-2xl border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={feature.img}
                  alt={t(`plat.${feature.key}.t`)}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                <span
                  className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm ${
                    feature.live ? "bg-primary text-primary-foreground" : "bg-background/85 text-muted-foreground"
                  }`}
                >
                  {feature.live ? t("plat.live") : t("plat.soon")}
                </span>
                <div className="absolute bottom-3 left-5 flex h-12 w-12 items-center justify-center rounded-xl border bg-background shadow-card">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="p-7 pt-5">
                <h3 className="font-display text-xl font-semibold text-card-foreground">
                  {t(`plat.${feature.key}.t`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`plat.${feature.key}.d`)}
                </p>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default PlatformFeatures;
