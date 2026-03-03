import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface District {
  id: string;
  name: string;
  state: string;
}

export interface Village {
  id: string;
  name: string;
  district_id: string;
}

export interface EquipmentRow {
  id: string;
  name: string;
  type: string;
  description: string | null;
  price_per_hour: number;
  price_per_day: number;
  owner_name: string;
  whatsapp: string;
  village_id: string;
  district_id: string;
  available: boolean;
  quantity: number;
  image_url: string | null;
  created_at: string;
  // joined
  districts?: { name: string };
  villages?: { name: string };
}

export const equipmentTypes = [
  { value: "all", label: "All Equipment" },
  { value: "tractor", label: "Tractor" },
  { value: "rotavator", label: "Rotavator" },
  { value: "harvester", label: "Harvester" },
  { value: "cultivator", label: "Cultivator" },
  { value: "sprayer", label: "Sprayer" },
  { value: "plough", label: "Plough" },
  { value: "seed_drill", label: "Seed Drill" },
  { value: "thresher", label: "Thresher" },
];

export function useDistricts() {
  return useQuery({
    queryKey: ["districts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("districts")
        .select("id, name, state")
        .order("name");
      if (error) throw error;
      return data as District[];
    },
  });
}

export function useVillages(districtId?: string) {
  return useQuery({
    queryKey: ["villages", districtId],
    queryFn: async () => {
      let query = supabase.from("villages").select("id, name, district_id").order("name");
      if (districtId) {
        query = query.eq("district_id", districtId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Village[];
    },
    enabled: districtId ? true : true,
  });
}

export function useEquipment(filters?: { type?: string; districtId?: string; villageId?: string; search?: string }) {
  return useQuery({
    queryKey: ["equipment", filters],
    queryFn: async () => {
      let query = supabase
        .from("equipment")
        .select("*, districts(name), villages(name)")
        .order("created_at", { ascending: false });

      if (filters?.type && filters.type !== "all") {
        query = query.eq("type", filters.type);
      }
      if (filters?.districtId && filters.districtId !== "all") {
        query = query.eq("district_id", filters.districtId);
      }
      if (filters?.villageId && filters.villageId !== "all") {
        query = query.eq("village_id", filters.villageId);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,owner_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EquipmentRow[];
    },
  });
}

export async function insertEquipment(equipment: {
  name: string;
  type: string;
  description: string;
  price_per_hour: number;
  price_per_day: number;
  owner_name: string;
  whatsapp: string;
  village_id: string;
  district_id: string;
  quantity: number;
}) {
  const { data, error } = await supabase.from("equipment").insert(equipment).select();
  if (error) throw error;
  return data;
}
