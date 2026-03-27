export interface BinData {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  wet: number;
  dry: number;
  metal: number;
  usage: number;
  history: number[]; // Last 7 days usage
  lastUpdated: string;
  status: 'online' | 'offline';
  connection: 'wifi' | 'gsm';
  dryCount?: number;
  wetCount?: number;
  distance?: number;
  field1?: number;
  field2?: number;
  field3?: number;
  field4?: number;
  field5?: number;
  field6?: number;
  field7?: number;
  field8?: number;
}

export const mockBins: BinData[] = [
  {
    id: "bin_001",
    name: "Connaught Place - Block A",
    location: { lat: 28.6315, lng: 77.2167 },
    wet: 75,
    dry: 40,
    metal: 10,
    usage: 342,
    history: [210, 245, 280, 310, 290, 320, 342],
    lastUpdated: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    status: 'online',
    connection: 'wifi'
  },
  {
    id: "bin_002",
    name: "India Gate - North",
    location: { lat: 28.6129, lng: 77.2295 },
    wet: 90,
    dry: 85,
    metal: 30,
    usage: 512,
    history: [450, 480, 420, 500, 550, 490, 512],
    lastUpdated: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    status: 'online',
    connection: 'gsm'
  },
  {
    id: "bin_003",
    name: "Hauz Khas Village",
    location: { lat: 28.5535, lng: 77.1936 },
    wet: 20,
    dry: 60,
    metal: 5,
    usage: 128,
    history: [100, 110, 105, 120, 115, 130, 128],
    lastUpdated: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: 'online',
    connection: 'wifi'
  },
  {
    id: "bin_004",
    name: "Lajpat Nagar Market",
    location: { lat: 28.5677, lng: 77.2433 },
    wet: 85,
    dry: 95,
    metal: 45,
    usage: 890,
    history: [700, 750, 820, 800, 850, 880, 890],
    lastUpdated: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
    status: 'online',
    connection: 'wifi'
  },
  {
    id: "bin_005",
    name: "Saket Metro Station",
    location: { lat: 28.5246, lng: 77.2066 },
    wet: 10,
    dry: 15,
    metal: 2,
    usage: 45,
    history: [40, 42, 38, 45, 43, 46, 45],
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: 'offline',
    connection: 'gsm'
  }
];
