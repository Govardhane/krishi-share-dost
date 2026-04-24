import { useQuery } from "@tanstack/react-query";
import { api, API_URL, getToken } from "./api";

export interface District {
  id: string;
  name: string;
  state: string;
}

export interface Taluka {
  id: string;
  name: string;
  district_id: string;
}

export interface Village {
  id: string;
  name: string;
  district_id: string;
  taluka_id: string | null;
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
  taluka_id: string | null;
  available: boolean;
  quantity: number;
  image_url: string | null;
  created_at: string;
  // joined client-side for backward compat
  districts?: { name: string };
  villages?: { name: string };
  talukas?: { name: string } | null;
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

// ---------- Locations ----------
export function useDistricts() {
  return useQuery({
    queryKey: ["districts"],
    queryFn: async () => api<District[]>("/api/districts"),
  });
}

export function useTalukas(districtId?: string) {
  return useQuery({
    queryKey: ["talukas", districtId],
    queryFn: async () => {
      if (!districtId) return [] as Taluka[];
      return await api<Taluka[]>("/api/talukas", { query: { district_id: districtId } });
    },
    enabled: !!districtId,
  });
}

export function useVillages(talukaId?: string) {
  return useQuery({
    queryKey: ["villages", talukaId],
    queryFn: async () => {
      if (!talukaId) return [] as Village[];
      return await api<Village[]>("/api/villages", { query: { taluka_id: talukaId } });
    },
    enabled: !!talukaId,
  });
}

// ---------- Helpers to join location names client-side ----------
async function joinNames(rows: EquipmentRow[]): Promise<EquipmentRow[]> {
  if (!rows.length) return rows;
  const [districts, allTalukas, allVillages] = await Promise.all([
    api<District[]>("/api/districts"),
    api<Taluka[]>("/api/talukas"),
    api<Village[]>("/api/villages"),
  ]);
  const dMap = new Map(districts.map((d) => [d.id, d]));
  const tMap = new Map(allTalukas.map((t) => [t.id, t]));
  const vMap = new Map(allVillages.map((v) => [v.id, v]));

  return rows.map((r) => ({
    ...r,
    available: !!r.available,
    districts: dMap.get(r.district_id) ? { name: dMap.get(r.district_id)!.name } : undefined,
    villages: vMap.get(r.village_id) ? { name: vMap.get(r.village_id)!.name } : undefined,
    talukas: r.taluka_id && tMap.get(r.taluka_id) ? { name: tMap.get(r.taluka_id)!.name } : null,
  }));
}

// ---------- Equipment ----------
export function useEquipment(filters?: {
  type?: string;
  districtId?: string;
  talukaId?: string;
  villageId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["equipment", filters],
    queryFn: async () => {
      const query: Record<string, string | undefined> = {};
      if (filters?.type && filters.type !== "all") query.type = filters.type;
      if (filters?.districtId && filters.districtId !== "all") query.district_id = filters.districtId;
      if (filters?.talukaId && filters.talukaId !== "all") query.taluka_id = filters.talukaId;
      if (filters?.villageId && filters.villageId !== "all") query.village_id = filters.villageId;

      let rows = await api<EquipmentRow[]>("/api/equipment", { query });

      // Client-side text search (backend does location filtering only)
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        rows = rows.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.owner_name.toLowerCase().includes(q) ||
            (r.description ?? "").toLowerCase().includes(q)
        );
      }
      return await joinNames(rows);
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
  taluka_id: string;
  district_id: string;
  quantity: number;
  owner_user_id: string;
  image_url?: string | null;
}) {
  return await api<EquipmentRow>("/api/equipment", {
    method: "POST",
    body: equipment,
    auth: true,
  });
}

export function useMyEquipment(userId?: string) {
  return useQuery({
    queryKey: ["my-equipment", userId],
    queryFn: async () => {
      if (!userId) return [] as EquipmentRow[];
      const rows = await api<EquipmentRow[]>("/api/equipment/mine", { auth: true });
      return await joinNames(rows);
    },
    enabled: !!userId,
  });
}

export async function deleteEquipment(id: string) {
  await api(`/api/equipment/${id}`, { method: "DELETE", auth: true });
}

export async function uploadEquipmentPhoto(file: File, _userId: string) {
  const fd = new FormData();
  fd.append("photo", file);
  const token = getToken();
  const res = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: fd,
  });
  if (!res.ok) {
    let msg = "Upload failed";
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}
