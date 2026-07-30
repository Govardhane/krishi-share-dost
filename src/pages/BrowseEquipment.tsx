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
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [talukaFilter, setTalukaFilter] = useState("all");
  const [villageFilter, setVillageFilter] = useState("all");
  const [appliedDefault, setAppliedDefault] = useState(false);

  // Lock browsing to the user's own area (district + taluka) once profile loads
  useEffect(() => {
    if (!appliedDefault && profile?.district_id) {
      setDistrictFilter(profile.district_id);
      if (profile.taluka_id) setTalukaFilter(profile.taluka_id);
      setAppliedDefault(true);
    }
  }, [profile, appliedDefault]);

  const { data: districts } = useDistricts();
  const { data: talukas } = useTalukas(districtFilter !== "all" ? districtFilter : undefined);
  const { data: villages } = useVillages(talukaFilter !== "all" ? talukaFilter : undefined);
  const hasArea = !!profile?.district_id;
  const { data: equipment, isLoading } = useEquipment({
    type: typeFilter,
    districtId: districtFilter,
    talukaId: talukaFilter,
    villageId: villageFilter,
    search: search || undefined,
  });

  const filtered = user && hasArea ? equipment || [] : [];

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
          <Lock className="h-10 w-10 text-primary" />
          <h1 className="mt-4 font-display text-3xl font-bold text-foreground">Login to browse equipment</h1>
          <p className="mt-3 text-muted-foreground">
            Rental listings sirf logged-in farmers ko dikhte hain — aur aapko sirf aapke apne area ka equipment
            dikhaya jayega.
          </p>
          <Link to="/auth" className="mt-6">
            <Button size="lg">Login / Register</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profileLoading && !hasArea) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
          <MapPin className="h-10 w-10 text-primary" />
          <h1 className="mt-4 font-display text-3xl font-bold text-foreground">Set your location first</h1>
          <p className="mt-3 text-muted-foreground">
            Apna district, taluka aur village profile me save karein — uske baad aapke area ka available equipment
            dikhne lagega.
          </p>
          <Link to="/profile" className="mt-6">
            <Button size="lg">Go to Profile</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          Equipment near you
        </h1>
        <p className="mt-2 text-muted-foreground">
          Aapke taluka ka available equipment — best value (rating + features vs rate) sabse upar
        </p>

        <div className="mt-4 rounded-lg border bg-card p-3 text-sm text-muted-foreground">
          Showing equipment in your saved area. Filters se aap apne district ke doosre taluka / village bhi dekh
          sakte hain.
        </div>


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
              <SelectValue placeholder="Taluka / Sub-district" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Talukas / Sub-districts</SelectItem>
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
