import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { equipmentTypes } from "@/lib/equipmentData";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

const ListEquipment = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Equipment listed successfully! Farmers can now find your equipment.");
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
                <Input id="name" placeholder="e.g., Mahindra 575 DI" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Equipment Type</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentTypes
                      .filter((t) => t.value !== "all")
                      .map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
                placeholder="Describe your equipment condition, features, etc."
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="priceHour">Price per Hour (₹)</Label>
                <Input id="priceHour" type="number" placeholder="500" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceDay">Price per Day (₹)</Label>
                <Input id="priceDay" type="number" placeholder="3500" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Available Quantity</Label>
                <Input id="quantity" type="number" placeholder="1" required />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ownerName">Your Name</Label>
                <Input id="ownerName" placeholder="Full name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input id="whatsapp" placeholder="e.g., 919876543210" required />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="village">Village</Label>
                <Input id="village" placeholder="Your village" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Input id="district" placeholder="Your district" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" placeholder="Your state" required />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full">
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
