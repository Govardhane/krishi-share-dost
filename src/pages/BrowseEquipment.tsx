import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EquipmentCard from "@/components/EquipmentCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEquipment, useDistricts, useTalukas, useVillages, equipmentTypes } from "@/lib/equipmentData";
import { Search, MapPin, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

const BrowseEquipment = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [talukaFilter, setTalukaFilter] = useState("all");
  const [villageFilter, setVillageFilter] = useState("all");
  const [appliedDefault, setAppliedDefault] = useState(false);

  // Default-filter to user's taluka after profile loads (one time)
  useEffect(() => {
    if (!appliedDefault && profile?.district_id && profile?.taluka_id) {
      setDistrictFilter(profile.district_id);
      setTalukaFilter(profile.taluka_id);
      setAppliedDefault(true);
    }
  }, [profile, appliedDefault]);

  const { data: districts } = useDistricts();
  const { data: talukas } = useTalukas(districtFilter !== "all" ? districtFilter : undefined);
  const { data: villages } = useVillages(talukaFilter !== "all" ? talukaFilter : undefined);
  const { data: equipment, isLoading } = useEquipment({
    type: typeFilter,
    districtId: districtFilter,
    talukaId: talukaFilter,
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
          Search by district, taluka, village or equipment type
        </p>

        {!user && (
          <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
            <Link to="/auth" className="font-medium text-primary underline">Login</Link> to automatically see equipment available in your taluka.
          </div>
        )}
        {user && profile?.taluka_id && appliedDefault && talukaFilter === profile.taluka_id && (
          <div className="mt-4 rounded-lg border bg-card p-3 text-sm text-muted-foreground">
            Showing equipment in your taluka. Change filters below to browse other areas.
          </div>
        )}

        {/* Filters */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
              setTalukaFilter("all");
              setVillageFilter("all");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="District" />
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
          <Select
            value={talukaFilter}
            onValueChange={(val) => {
              setTalukaFilter(val);
              setVillageFilter("all");
            }}
            disabled={districtFilter === "all"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Taluka" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Talukas</SelectItem>
              {talukas?.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={villageFilter}
            onValueChange={setVillageFilter}
            disabled={talukaFilter === "all"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Village" />
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
