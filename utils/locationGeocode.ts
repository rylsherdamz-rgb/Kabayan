import { GOOGLE_MAPS_KEY } from "@/utils/googleMapsConfig";

export type GeoResult = {
  latitude: number;
  longitude: number;
};

export async function geocodeAddress(address: string): Promise<GeoResult | null> {
  if (!address.trim() || !GOOGLE_MAPS_KEY) return null;

  try {
    const encoded = encodeURIComponent(address.trim());
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${GOOGLE_MAPS_KEY}`;
    const resp = await fetch(url);
    if (!resp.ok) return null;

    const json = await resp.json();
    if (json.status !== "OK" || !json.results?.length) return null;

    const loc = json.results[0].geometry.location;
    return { latitude: loc.lat, longitude: loc.lng };
  } catch {
    return null;
  }
}
