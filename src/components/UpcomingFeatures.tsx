import { Sparkles, Sprout, Users, CloudSun, Tractor, Wheat } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Crop Advisory",
    description: "Get personalized crop suggestions, pest alerts, and fertilizer tips from AI for your soil and season.",
    status: "Coming Soon",
  },
  {
    icon: Sprout,
    title: "Seeds & Fertilizers",
    description: "Buy verified seeds, organic fertilizers, and farm inputs directly from local suppliers at fair prices.",
    status: "Coming Soon",
  },
  {
    icon: Users,
    title: "Farm Labor Network",
    description: "Hire skilled farm workers or find daily wage work near your village during sowing and harvest.",
    status: "Coming Soon",
  },
  {
    icon: Wheat,
    title: "Sell Farm Produce",
    description: "Connect with local mandis, traders, and direct buyers to get the best price for your crop.",
    status: "Coming Soon",
  },
  {
    icon: CloudSun,
    title: "Weather & Alerts",
    description: "Daily weather forecasts, rainfall warnings, and government scheme updates tailored to your district.",
    status: "Coming Soon",
  },
  {
    icon: Tractor,
    title: "Smart Equipment Rentals",
    description: "AI will match you with the right equipment near your village based on crop, season, and budget.",
    status: "Live Now",
  },
];

const UpcomingFeatures = () => {
  return (
    <section className="relative overflow-hidden py-20">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

      <div className="container relative mx-auto px-4">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary">
            <Sparkles className="h-4 w-4" />
            Growing beyond rentals
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
            Upcoming AI- Agrishare Features
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            We are building a complete AI-powered farming ecosystem. Right now equipment rental is live; more tools are on the way.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border bg-card p-7 shadow-card transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    feature.status === "Live Now"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {feature.status}
                </span>
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-card-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpcomingFeatures;
