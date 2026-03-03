import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EquipmentCard from "@/components/EquipmentCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sampleEquipment, equipmentTypes } from "@/lib/equipmentData";
import { Search, MapPin } from "lucide-react";

const BrowseEquipment = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(() => {
    return sampleEquipment.filter((eq) => {
      const matchesType = typeFilter === "all" || eq.type === typeFilter;
      const query = search.toLowerCase();
      const matchesSearch =
        !query ||
        eq.name.toLowerCase().includes(query) ||
        eq.village.toLowerCase().includes(query) ||
        eq.district.toLowerCase().includes(query) ||
        eq.state.toLowerCase().includes(query);
      return matchesType && matchesSearch;
    });
  }, [search, typeFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          Browse Equipment
        </h1>
        <p className="mt-2 text-muted-foreground">
          Search by village, district, or equipment type
        </p>

        {/* Filters */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by village, district, or name..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Equipment Type" />
            </SelectTrigger>
            <SelectContent>
              {equipmentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{filtered.length} equipment found</span>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((eq) => (
            <EquipmentCard key={eq.id} equipment={eq} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-lg text-muted-foreground">
              No equipment found. Try a different search or filter.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BrowseEquipment;
