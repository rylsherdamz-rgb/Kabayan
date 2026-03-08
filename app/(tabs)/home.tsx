import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import CustomSearchComponent from "@/components/CustomComponents/CustomSearchComponent";
import CustomMapComponents from "@/components/CustomComponents/CustomMapComponents";
import { useTheme } from "@/hooks/useTheme";
import { supabaseClient } from "@/utils/supabase";

type JobRow = {
  id: string;
  title: string;
  description?: string;
  location_label: string;
  budget_min: number;
  budget_max: number;
  is_urgent: boolean;
  status: string;
  created_at: string;
};

export default function Home() {
  const router = useRouter();
  const { t } = useTheme();
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const loadLatestJobs = async () => {
    setLoadingJobs(true);
    const { data, error } = await supabaseClient.rpc("rpc_get_jobs");
    if (!error && data) {
      setJobs(data as JobRow[]);
    }
    setLoadingJobs(false);
  };

  useEffect(() => {
    loadLatestJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    const source = jobs.filter((job) => job.status === "open");
    if (!q) return source.slice(0, 6);
    return source
      .filter((job) => {
        return (
          job.title.toLowerCase().includes(q) ||
          (job.location_label ?? "").toLowerCase().includes(q) ||
          (job.description ?? "").toLowerCase().includes(q)
        );
      })
      .slice(0, 6);
  }, [jobs, search]);

  return (
    <View className={`flex-1 ${t.bgPage}`}>
      <View className="pt-6 px-[5%]">
        <CustomSearchComponent
          onSearch={setSearch}
          onNavigateToMap={() => router.push("/map/mapView")}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-[5%] mt-6">
        <View className="mb-6">
          <View className="flex-row justify-between items-end mb-4">
            <Text className={`text-lg font-black tracking-tight ${t.text}`}>Nearby Opportunities</Text>
            <TouchableOpacity onPress={() => router.push("/jobs")}> 
              <Text className={`text-xs font-bold ${t.brand}`}>See All</Text>
            </TouchableOpacity>
          </View>

          <Pressable
            onPress={() => router.push("/map/mapView")}
            className="h-64 rounded-[32px] overflow-hidden border border-slate-200 shadow-lg"
          >
            <CustomMapComponents />
          </Pressable>
        </View>

        <View className="mb-10">
          <View className="flex-row justify-between items-end mb-4">
            <Text className={`text-lg font-black tracking-tight ${t.text}`}>Latest Jobs</Text>
            <TouchableOpacity onPress={loadLatestJobs}>
              <Text className={`text-xs font-bold ${t.brand}`}>Refresh</Text>
            </TouchableOpacity>
          </View>

          {loadingJobs ? (
            <View className={`p-6 rounded-[28px] ${t.bgCard} border ${t.border} items-center`}>
              <ActivityIndicator />
              <Text className={`mt-2 text-xs ${t.textMuted}`}>Loading jobs…</Text>
            </View>
          ) : filteredJobs.length === 0 ? (
            <View className={`p-6 rounded-[28px] ${t.bgCard} border ${t.border}`}>
              <Text className={`text-sm font-semibold ${t.text}`}>No jobs found</Text>
              <Text className={`mt-2 text-xs ${t.textMuted}`}>Try another search or check back later.</Text>
            </View>
          ) : (
            filteredJobs.map((job) => (
              <TouchableOpacity
                key={job.id}
                onPress={() => router.push({ pathname: "/job/JobView", params: { jobId: job.id } })}
                className={`p-4 mb-3 rounded-2xl ${t.bgCard} border ${t.border}`}
                activeOpacity={0.85}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-3">
                    <Text className={`text-base font-black ${t.text}`}>{job.title}</Text>
                    <View className="flex-row items-center mt-1">
                      <Feather name="map-pin" size={12} color={t.icon} />
                      <Text className={`ml-1 text-[11px] font-semibold ${t.textMuted}`}>{job.location_label}</Text>
                    </View>
                  </View>
                  <Text className="text-emerald-600 text-xs font-black">{formatBudget(job.budget_min, job.budget_max)}</Text>
                </View>

                <View className="mt-3 flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name={job.is_urgent ? "lightning-bolt" : "briefcase-outline"}
                      size={13}
                      color={job.is_urgent ? "#DC2626" : "#2563EB"}
                    />
                    <Text className={`ml-1 text-[10px] font-black uppercase ${t.textMuted}`}>
                      {job.is_urgent ? "Urgent" : job.status}
                    </Text>
                  </View>
                  <Text className={`text-[10px] font-bold ${t.textMuted}`}>{formatTime(job.created_at)}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const formatBudget = (min: number, max: number) => {
  if (!min && !max) return "N/A";
  if (min === max) return `₱${min.toLocaleString()}`;
  return `₱${min.toLocaleString()} - ₱${max.toLocaleString()}`;
};

const formatTime = (iso: string) => {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString();
};
