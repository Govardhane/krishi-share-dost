import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { equipmentTypes, useDistricts, useVillages, insertEquipment } from "@/lib/equipmentData";
import { toast } from "sonner";
import { CheckCircle, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const ListEquipment = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [districtId, setDistrictId] = useState("");
  const [villageId, setVillageId] = useState("");
  const [type, setType] = useState("");

  const { data: districts } = useDistricts();
  const { data: villages } = useVillages(districtId || undefined);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (!districtId || !villageId || !type) {
      toast.error("Please select district, village and equipment type");
      return;
    }

    setLoading(true);
    try {
      await insertEquipment({
        name: formData.get("name") as string,
        type,
        description: formData.get("description") as string,
        price_per_hour: Number(formData.get("priceHour")),
        price_per_day: Number(formData.get("priceDay")),
        owner_name: formData.get("ownerName") as string,
        whatsapp: formData.get("whatsapp") as string,
        village_id: villageId,
        district_id: districtId,
        quantity: Number(formData.get("quantity")) || 1,
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
            Your equipment is now visible to farmers in your area. They'll contact you via WhatsApp.
          </p>
          <Button className="mt-6" onClick={() => setSubmitted(false)}>
            List Another Equipment
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

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
                <Input id="ownerName" name="ownerName" placeholder="Full name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input id="whatsapp" name="whatsapp" placeholder="e.g., 919876543210" required />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>District</Label>
                <Select
                  value={districtId}
                  onValueChange={(val) => {
                    setDistrictId(val);
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
                <Label>Village / Taluka</Label>
                <Select value={villageId} onValueChange={setVillageId} disabled={!districtId}>
                  <SelectTrigger>
                    <SelectValue placeholder={districtId ? "Select village" : "Select district first"} />
                  </SelectTrigger>
                  <SelectContent>
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
