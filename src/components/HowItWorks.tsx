import { Search, Phone, Tractor } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search Equipment",
    description: "Browse tractors, harvesters, and more by your village or district.",
  },
  {
    icon: Phone,
    title: "Contact Owner",
    description: "Reach the equipment owner directly via WhatsApp for quick booking.",
  },
  {
    icon: Tractor,
    title: "Rent & Farm",
    description: "Get the equipment delivered and start farming efficiently.",
  },
];

const HowItWorks = () => {
  return (
    <section className="bg-muted py-20">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Renting farm equipment is as easy as booking a ride
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative rounded-xl border bg-card p-8 text-center shadow-card"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary">
                <step.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-secondary font-body text-sm font-bold text-secondary-foreground">
                {i + 1}
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-card-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
