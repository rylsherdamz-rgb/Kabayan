import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/utils/supabase";

type JobDetail = {
  id: string;
  employer_id?: string;
  title: string;
  description: string;
  location_label: string;
  budget_min: number;
  budget_max: number;
  is_urgent: boolean;
  status: string;
  created_at: string;
};

export default function JobView() {
  const { t } = useTheme();
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId?: string }>();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      setLoading(true);
      const { data, error } = await supabaseClient
        .rpc("rpc_get_job_by_id", { p_job_id: jobId })
        .maybeSingle();
      if (!error && data) setJob(data);
      setLoading(false);
    };
    fetchJob();
  }, [jobId]);

  if (loading) {
    return (
      <View className={`flex-1 items-center justify-center ${t.bgPage}`}>
        <ActivityIndicator />
        <Text className={`mt-2 ${t.textMuted}`}>Loading job…</Text>
      </View>
    );
  }

  if (!job) {
    return (
      <View className={`flex-1 items-center justify-center ${t.bgPage}`}>
        <Text className={`text-base font-semibold ${t.text}`}>Job not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-3 px-4 py-2 bg-blue-600 rounded-full">
          <Text className="text-white font-bold">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const salary = formatBudget(job.budget_min, job.budget_max);
  const isClosed = job.status !== "open";

  const handleApply = async () => {
    if (!job || applying) return;

    setApplying(true);
    try {
      const { data: userData, error: userError } = await supabaseClient.auth.getUser();
      if (userError) throw new Error(userError.message);
      if (!userData.user) {
        Alert.alert("Sign in required", "Please sign in before applying.");
        return;
      }

      const { error } = await supabaseClient.rpc("rpc_apply_to_job", {
        p_job_id: job.id,
      });
      if (error) throw new Error(error.message);

      Alert.alert("Application sent", "Your application has been submitted.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to apply right now.";
      Alert.alert("Apply failed", message);
    } finally {
      setApplying(false);
    }
  };

  const handleMessageEmployer = async () => {
    if (!job || messaging) return;

    setMessaging(true);
    try {
      const { data: userData, error: userError } = await supabaseClient.auth.getUser();
      if (userError) throw new Error(userError.message);
      if (!userData.user) {
        Alert.alert("Sign in required", "Please sign in to message the employer.");
        return;
      }

      let roomId: string | null = null;
      if (job.employer_id) {
        const unified = await supabaseClient.rpc("rpc_open_job_conversation_with_user", {
          p_job_id: job.id,
          p_other_user_id: job.employer_id,
        });
        if (!unified.error && unified.data) {
          roomId = unified.data;
        }
      }

      if (!roomId) {
        const primary = await supabaseClient.rpc("rpc_open_job_conversation_for_job", {
          p_job_id: job.id,
        });
        if (!primary.error && primary.data) {
          roomId = primary.data;
        }
      }

      if (!roomId && job.employer_id) {
        // Legacy fallback for older DBs.
        const legacy = await supabaseClient.rpc("rpc_open_job_conversation", {
          p_job_id: job.id,
          p_employer_id: job.employer_id,
        });
        if (!legacy.error && legacy.data) {
          roomId = legacy.data;
        }
      }

      if (!roomId) {
        throw new Error("Could not open conversation. Run `npx supabase db push` and restart the app.");
      }

      router.push({
        pathname: "/chatRoom/chatRoom",
        params: {
          roomId,
          name: "Employer",
          jobTitle: job.title,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to open chat right now.";
      Alert.alert("Message failed", message);
    } finally {
      setMessaging(false);
    }
  };

  return (
    <View className={`flex-1 ${t.bgPage}`}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="bg-white">
          <Image 
            source={{ uri: "https://images.unsplash.com/photo-1504150559640-a0ce165d472d?w=800" }}
            className="w-full h-40"
            resizeMode="cover"
          />
          
          <View className="px-5 pb-6">
            <View className="relative -mt-12 mb-4">
              <Image
                source={{ uri: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400" }}
                className="w-24 h-24 rounded-2xl border-4 border-white shadow-sm"
              />
              <View className="absolute bottom-0 left-20 bg-white w-8 h-8 rounded-full items-center justify-center shadow-md border border-slate-100">
                <Feather name="briefcase" size={14} color="#475569" />
              </View>
            </View>

            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className={`text-2xl font-bold tracking-tight ${t.text}`}>{job.title}</Text>
                <Text className="text-blue-600 font-semibold text-sm">{job.location_label}</Text>
                <Text className={`text-sm mt-1 ${t.textMuted}`}>{formatTime(job.created_at)}</Text>
              </View>
              <View className="items-end">
                <Text className="text-emerald-600 font-black text-lg">{salary}</Text>
                <View className="bg-red-50 px-2 py-1 rounded-md mt-2">
                  <Text className="text-red-600 font-black text-[10px] uppercase tracking-widest">
                    {job.is_urgent ? "Urgent" : job.status}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="px-4 mt-6">
          <Text className={`text-xs font-bold ${t.textMuted} uppercase tracking-widest mb-3 ml-1`}>Description</Text>
          <View className={`p-4 rounded-2xl ${t.bgCard} border ${t.border}`}>
            <Text className={`${t.text} leading-6`}>{job.description || "No description provided."}</Text>
          </View>

          <Text className={`text-xs font-bold ${t.textMuted} uppercase tracking-widest mt-6 mb-3 ml-1`}>Location</Text>
          <View className={`p-4 rounded-2xl ${t.bgCard} border ${t.border} flex-row items-center`}>
            <Ionicons name="location-sharp" size={18} color={t.icon} />
            <Text className={`ml-2 flex-1 ${t.text}`}>{job.location_label}</Text>
            <TouchableOpacity
              onPress={() => router.push({ pathname: "/map/mapView", params: { location: job.location_label } })}
              className="ml-3 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 flex-row items-center"
              activeOpacity={0.85}
            >
              <Ionicons name="map" size={16} color="#2563eb" />
              <Text className="ml-1 text-blue-700 text-xs font-bold">View Map</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-3 mt-6">
            <TouchableOpacity
              onPress={handleApply}
              disabled={applying || isClosed}
              className={`flex-1 py-4 rounded-2xl items-center shadow-sm ${isClosed ? "bg-slate-400" : "bg-blue-600"}`}
            >
              <Text className="text-white font-black">{applying ? "Applying..." : "Apply Now"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleMessageEmployer}
              disabled={messaging}
              className={`flex-1 ${t.bgCard} border ${t.border} py-4 rounded-2xl items-center`}
            >
              <Text className={`${t.text} font-black`}>{messaging ? "Opening..." : "Message Employer"}</Text>
            </TouchableOpacity>
          </View>

          <View className="h-10" />
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
  return date.toLocaleDateString();
};
