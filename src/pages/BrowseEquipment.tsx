import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EquipmentCard from "@/components/EquipmentCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEquipment, useDistricts, useVillages, equipmentTypes } from "@/lib/equipmentData";
import { Search, MapPin, Loader2 } from "lucide-react";

const BrowseEquipment = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [villageFilter, setVillageFilter] = useState("all");

  const { data: districts } = useDistricts();
  const { data: villages } = useVillages(districtFilter !== "all" ? districtFilter : undefined);
  const { data: equipment, isLoading } = useEquipment({
    type: typeFilter,
    districtId: districtFilter,
    villageId: villageFilter,
    search: search || undefined,
  });

  const filtered = equipment || [];

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
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
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
          <Select
            value={districtFilter}
            onValueChange={(val) => {
              setDistrictFilter(val);
              setVillageFilter("all");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select District" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {districts?.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={villageFilter} onValueChange={setVillageFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Select Village/Taluka" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Villages</SelectItem>
              {villages?.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
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

        {isLoading ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((eq) => (
              <EquipmentCard key={eq.id} equipment={eq} />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
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
