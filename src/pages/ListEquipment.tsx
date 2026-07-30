import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { equipmentTypes, useDistricts, useTalukas, useVillages, insertEquipment, uploadEquipmentPhoto } from "@/lib/equipmentData";
import { toast } from "sonner";
import { CheckCircle, Loader2, ImagePlus, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

const ListEquipment = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [districtId, setDistrictId] = useState("");
  const [talukaId, setTalukaId] = useState("");
  const [villageId, setVillageId] = useState("");
  const [type, setType] = useState("");
  const [tractorClass, setTractorClass] = useState("");
  const [condition, setCondition] = useState("good");
  const [features, setFeatures] = useState<string[]>([]);
  const [paymentModes, setPaymentModes] = useState<string[]>(["advance_cash"]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const toggle = (list: string[], set: (v: string[]) => void, val: string) =>
    set(list.includes(val) ? list.filter((v) => v !== val) : [...list, val]);


  const { data: districts } = useDistricts();
  const { data: talukas } = useTalukas(districtId || undefined);
  const { data: villages } = useVillages(talukaId || undefined);
  const queryClient = useQueryClient();

  // Pre-fill location from profile
  useEffect(() => {
    if (profile && !districtId) {
      if (profile.district_id) setDistrictId(profile.district_id);
      if (profile.taluka_id) setTalukaId(profile.taluka_id);
      if (profile.village_id) setVillageId(profile.village_id);
    }
  }, [profile, districtId]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" state={{ from: "/list-equipment" }} replace />;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (!districtId || !talukaId || !villageId || !type) {
      toast.error("Please select district, taluka, village and equipment type");
      return;
    }

    setLoading(true);
    try {
      let imageUrl: string | null = null;
      if (photoFile) {
        try {
          imageUrl = await uploadEquipmentPhoto(photoFile, user.id);
        } catch (uploadErr: any) {
          toast.error(uploadErr.message || "Photo upload failed");
          setLoading(false);
          return;
        }
      }

      await insertEquipment({
        name: formData.get("name") as string,
        type,
        description: formData.get("description") as string,
        price_per_hour: Number(formData.get("priceHour")),
        price_per_day: Number(formData.get("priceDay")),
        owner_name: (formData.get("ownerName") as string) || profile?.full_name || "",
        whatsapp: (formData.get("whatsapp") as string) || profile?.whatsapp || "",
        village_id: villageId,
        taluka_id: talukaId,
        district_id: districtId,
        quantity: Number(formData.get("quantity")) || 1,
        owner_user_id: user.id,
        image_url: imageUrl,
        brand: (formData.get("brand") as string) || null,
        model: (formData.get("model") as string) || null,
        hp: formData.get("hp") ? Number(formData.get("hp")) : null,
        tractor_class: tractorClass || null,
        year_of_purchase: formData.get("year") ? Number(formData.get("year")) : null,
        condition: condition || null,
        features,
        payment_modes: paymentModes.length ? paymentModes : ["advance_cash"],
        advance_percent: Number(formData.get("advancePercent")) || 0,
        upi_id: (formData.get("upiId") as string) || null,
      });

      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      setSubmitted(true);
      toast.success("Equipment listed successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to list equipment");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5 MB");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary">
            <CheckCircle className="h-10 w-10 text-primary-foreground" />
          </div>
          <h2 className="mt-6 font-display text-3xl font-bold text-foreground">
            Equipment Listed!
          </h2>
          <p className="mt-3 max-w-md text-muted-foreground">
            Your equipment is now visible to farmers in your area. They'll contact you via WhatsApp, Call or SMS.
          </p>
          <Button className="mt-6" onClick={() => setSubmitted(false)}>
            List Another Equipment
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const profileIncomplete = !profile?.full_name || !profile?.whatsapp;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            List Your Equipment
          </h1>
          <p className="mt-2 text-muted-foreground">
            Add your farming equipment and start earning by renting it out
          </p>

          {profileIncomplete && !profileLoading && (
            <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
              Complete your <Link to="/profile" className="font-medium text-primary underline">profile</Link> to auto-fill name, phone and location.
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Equipment Name</Label>
                <Input id="name" name="name" placeholder="e.g., Mahindra 575 DI" required />
              </div>
              <div className="space-y-2">
                <Label>Equipment Type</Label>
                <Select value={type} onValueChange={setType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentTypes
                      .filter((t) => t.value !== "all")
                      .map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your equipment condition, features, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Equipment Photo <span className="text-xs font-normal text-muted-foreground">(optional, max 5 MB)</span></Label>
              {photoPreview ? (
                <div className="relative w-full overflow-hidden rounded-lg border bg-muted">
                  <img src={photoPreview} alt="Equipment preview" className="h-56 w-full object-cover" />
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 shadow-sm hover:bg-background"
                    aria-label="Remove photo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="photo"
                  className="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 text-sm text-muted-foreground transition hover:border-primary/40 hover:bg-muted/50"
                >
                  <ImagePlus className="h-6 w-6" />
                  <span>Click to upload a photo (JPG / PNG)</span>
                </label>
              )}
              <input
                id="photo"
                name="photo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="priceHour">Price per Hour (₹)</Label>
                <Input id="priceHour" name="priceHour" type="number" placeholder="500" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceDay">Price per Day (₹)</Label>
                <Input id="priceDay" name="priceDay" type="number" placeholder="3500" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Available Quantity</Label>
                <Input id="quantity" name="quantity" type="number" placeholder="1" defaultValue="1" required />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ownerName">Your Name</Label>
                <Input id="ownerName" name="ownerName" placeholder="Full name" defaultValue={profile?.full_name || ""} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp / Phone Number</Label>
                <Input id="whatsapp" name="whatsapp" placeholder="e.g., 919876543210" defaultValue={profile?.whatsapp || ""} required />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>District</Label>
                <Select
                  value={districtId}
                  onValueChange={(val) => {
                    setDistrictId(val);
                    setTalukaId("");
                    setVillageId("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts?.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Taluka / Sub-district</Label>
                <Select
                  value={talukaId}
                  onValueChange={(val) => {
                    setTalukaId(val);
                    setVillageId("");
                  }}
                  disabled={!districtId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={districtId ? "Select taluka / sub-district" : "Select district first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {talukas?.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Village</Label>
                <Select value={villageId} onValueChange={setVillageId} disabled={!talukaId}>
                  <SelectTrigger>
                    <SelectValue placeholder={talukaId ? "Select village" : "Select taluka first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {villages?.length === 0 && (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No villages yet for this taluka / sub-district
                      </div>
                    )}
                    {villages?.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              List Equipment
            </Button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ListEquipment;
