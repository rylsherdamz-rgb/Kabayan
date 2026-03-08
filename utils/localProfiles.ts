import { MMKV, createMMKV } from "react-native-mmkv";

export type ProfileRow = {
  user_id: string;
  display_name: string;
  job_role: string;
  location_label: string;
  avatar_url: string | null;
  id_verification_status: "verified" | "pending_review" | "unverified";
  created_at: string;
};

const storage = createMMKV({ id: "kabayan-profiles" });
const STORAGE_KEY = "profiles";

const seedProfiles: ProfileRow[] = [];

const readProfiles = (): ProfileRow[] => {
  const raw = storage.getString(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      storage.remove(STORAGE_KEY);
    }
  }
  storage.set(STORAGE_KEY, JSON.stringify(seedProfiles));
  return seedProfiles;
};

const writeProfiles = (profiles: ProfileRow[]) => {
  storage.set(STORAGE_KEY, JSON.stringify(profiles));
};

export const getProfiles = () => readProfiles();

export const getProfileByUserId = (user_id: string) => readProfiles().find((p) => p.user_id === user_id) ?? null;

export const addOrUpdateProfile = (profile: ProfileRow) => {
  const existing = readProfiles();
  const filtered = existing.filter((p) => p.user_id !== profile.user_id);
  const updated = [profile, ...filtered];
  writeProfiles(updated);
  return profile;
};
