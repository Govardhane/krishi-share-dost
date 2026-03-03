import { useEquipment } from "@/lib/equipmentData";
import EquipmentCard from "./EquipmentCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";

const FeaturedEquipment = () => {
  const { data: equipment, isLoading } = useEquipment();
  const featured = (equipment || []).filter((e) => e.available).slice(0, 3);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Featured Equipment
            </h2>
            <p className="mt-2 text-muted-foreground">
              Top-rated machinery available for rent near you
            </p>
          </div>
          <Link to="/browse" className="hidden sm:block">
            <Button variant="ghost">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : featured.length === 0 ? (
          <div className="mt-10 rounded-xl border bg-card p-10 text-center">
            <p className="text-muted-foreground">No equipment listed yet. Be the first to list!</p>
            <Link to="/list-equipment">
              <Button className="mt-4">List Your Equipment</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((eq) => (
              <EquipmentCard key={eq.id} equipment={eq} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link to="/browse">
            <Button variant="outline">
              View All Equipment <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedEquipment;
