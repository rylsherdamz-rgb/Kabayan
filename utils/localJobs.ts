import { MMKV, createMMKV } from "react-native-mmkv";

export type JobRow = {
  id: string;
  title: string;
  description: string;
  location_label: string;
  budget_min: number;
  budget_max: number;
  is_urgent: boolean;
  status: string;
  created_at: string;
  latitude: number;
  longitude: number;
  employer_id: string | null;
  requirements: string[];
};

const storage = createMMKV({ id: "kabayan-jobs" });
const STORAGE_KEY = "jobs";

const sampleJobs: JobRow[] = [
  {
    id: "job01",
    title: "Emergency Pipe Repair",
    description: "Fix burst pipe on the 3rd floor, includes pressure test.",
    location_label: "Makati City",
    budget_min: 1500,
    budget_max: 2000,
    is_urgent: true,
    status: "open",
    created_at: new Date().toISOString(),
    latitude: 14.5547,
    longitude: 121.0244,
    employer_id: null,
    requirements: ["Licensed plumber", "Own tools"],
  },
];

const readJobs = (): JobRow[] => {
  const raw = storage.getString(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      storage.remove(STORAGE_KEY);
    }
  }
  storage.set(STORAGE_KEY, JSON.stringify(sampleJobs));
  return sampleJobs;
};

const writeJobs = (jobs: JobRow[]) => {
  storage.set(STORAGE_KEY, JSON.stringify(jobs));
};

export const getJobs = () => readJobs();

export const addJob = (job: JobRow) => {
  const existing = readJobs();
  const updated = [job, ...existing];
  writeJobs(updated);
  return job;
};

export const getJobById = (id: string) => readJobs().find((job) => job.id === id);

export const updateJobs = (jobs: JobRow[]) => writeJobs(jobs);
