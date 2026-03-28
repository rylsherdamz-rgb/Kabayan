import Constants from "expo-constants";

type ExpoConfigWithMaps = {
  ios?: {
    config?: {
      googleMapsApiKey?: string;
    };
  };
  android?: {
    config?: {
      googleMaps?: {
        apiKey?: string;
      };
    };
  };
};

const expoConfig = Constants.expoConfig as ExpoConfigWithMaps | null;

export const GOOGLE_MAPS_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY?.trim() ||
  process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY?.trim() ||
  expoConfig?.ios?.config?.googleMapsApiKey?.trim() ||
  expoConfig?.android?.config?.googleMaps?.apiKey?.trim() ||
  "";

export const hasGoogleMapsKey = GOOGLE_MAPS_KEY.length > 0;
