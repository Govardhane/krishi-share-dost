export interface Equipment {
  id: string;
  name: string;
  type: "tractor" | "rotavator" | "harvester" | "cultivator" | "sprayer" | "plough";
  image: string;
  pricePerHour: number;
  pricePerDay: number;
  ownerName: string;
  whatsapp: string;
  village: string;
  district: string;
  state: string;
  available: boolean;
  quantity: number;
  description: string;
}

export const equipmentTypes = [
  { value: "all", label: "All Equipment" },
  { value: "tractor", label: "Tractor" },
  { value: "rotavator", label: "Rotavator" },
  { value: "harvester", label: "Harvester" },
  { value: "cultivator", label: "Cultivator" },
  { value: "sprayer", label: "Sprayer" },
  { value: "plough", label: "Plough" },
];

export const sampleEquipment: Equipment[] = [
  {
    id: "1",
    name: "Mahindra 575 DI Tractor",
    type: "tractor",
    image: "",
    pricePerHour: 500,
    pricePerDay: 3500,
    ownerName: "Rajesh Kumar",
    whatsapp: "919876543210",
    village: "Rampur",
    district: "Lucknow",
    state: "Uttar Pradesh",
    available: true,
    quantity: 2,
    description: "Well-maintained 45 HP tractor, suitable for ploughing and hauling.",
  },
  {
    id: "2",
    name: "Shaktiman Rotavator 6ft",
    type: "rotavator",
    image: "",
    pricePerHour: 400,
    pricePerDay: 2800,
    ownerName: "Sunil Yadav",
    whatsapp: "919988776655",
    village: "Khandwa",
    district: "Indore",
    state: "Madhya Pradesh",
    available: true,
    quantity: 1,
    description: "Heavy-duty rotavator for soil preparation. 6 feet working width.",
  },
  {
    id: "3",
    name: "John Deere Combine Harvester",
    type: "harvester",
    image: "",
    pricePerHour: 1500,
    pricePerDay: 10000,
    ownerName: "Harpreet Singh",
    whatsapp: "919112233445",
    village: "Moga",
    district: "Moga",
    state: "Punjab",
    available: true,
    quantity: 1,
    description: "High-capacity combine harvester for wheat and paddy.",
  },
  {
    id: "4",
    name: "Swaraj 744 FE Tractor",
    type: "tractor",
    image: "",
    pricePerHour: 550,
    pricePerDay: 3800,
    ownerName: "Amar Patel",
    whatsapp: "919223344556",
    village: "Anand",
    district: "Anand",
    state: "Gujarat",
    available: true,
    quantity: 1,
    description: "48 HP tractor in excellent condition. Ideal for all farming operations.",
  },
  {
    id: "5",
    name: "Power Sprayer 20L",
    type: "sprayer",
    image: "",
    pricePerHour: 150,
    pricePerDay: 800,
    ownerName: "Lakshmi Devi",
    whatsapp: "919334455667",
    village: "Warangal",
    district: "Warangal",
    state: "Telangana",
    available: true,
    quantity: 3,
    description: "Battery-operated power sprayer for pesticide and fertilizer application.",
  },
  {
    id: "6",
    name: "MB Plough 3-Bottom",
    type: "plough",
    image: "",
    pricePerHour: 350,
    pricePerDay: 2200,
    ownerName: "Vinod Sharma",
    whatsapp: "919445566778",
    village: "Jaipur",
    district: "Jaipur",
    state: "Rajasthan",
    available: false,
    quantity: 1,
    description: "3-bottom mould board plough for deep ploughing.",
  },
];
