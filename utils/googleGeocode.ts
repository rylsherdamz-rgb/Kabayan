/**
 * Google Geocoding REST API helper.
 * Replaces expo-location.geocodeAsync for consistent, high-quality geocoding.
 */

const GOOGLE_MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY ?? '';

type GeoResult = {
  latitude: number;
  longitude: number;
};

/**
 * Geocode an address string to {latitude, longitude} using Google Geocoding API.
 * Returns null if no results or on network error.
 */
export async function geocodeAddress(address: string): Promise<GeoResult | null> {
  if (!address.trim()) return null;

  try {
    const encoded = encodeURIComponent(address.trim());
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${GOOGLE_MAPS_KEY}`;
    const resp = await fetch(url);
    if (!resp.ok) return null;

    const json = await resp.json();
    if (json.status !== 'OK' || !json.results?.length) return null;

    const loc = json.results[0].geometry.location;
    return { latitude: loc.lat, longitude: loc.lng };
  } catch {
    return null;
  }
}
