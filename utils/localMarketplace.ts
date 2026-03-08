import { MMKV, createMMKV } from "react-native-mmkv";

export type MarketListing = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  location_label: string;
  image_url: string | null;
  is_open: boolean;
  created_at: string;
  permit_verified: boolean;
};

const storage = createMMKV({ id: "kabayan-market" });
const STORAGE_KEY = "marketplace_listings";

const sampleItems: MarketListing[] = [
  {
    id: "listing01",
    name: "Pares Overload",
    description: "Tender beef soup, twice-seasoned, family recipe.",
    category: "Street Food",
    price: 120,
    location_label: "Quiapo, Manila",
    image_url: "https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=300",
    is_open: true,
    created_at: new Date().toISOString(),
    permit_verified: true,
  },
];

const readListings = (): MarketListing[] => {
  const raw = storage.getString(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      storage.remove(STORAGE_KEY);
    }
  }
  storage.set(STORAGE_KEY, JSON.stringify(sampleItems));
  return sampleItems;
};

const writeListings = (items: MarketListing[]) => {
  storage.set(STORAGE_KEY, JSON.stringify(items));
};

export const getListings = () => readListings();

export const addListing = (item: MarketListing) => {
  const existing = readListings();
  const updated = [item, ...existing];
  writeListings(updated);
  return item;
};

export const updateListings = (items: MarketListing[]) => writeListings(items);

export const getListingById = (id: string) => readListings().find((item) => item.id === id);
