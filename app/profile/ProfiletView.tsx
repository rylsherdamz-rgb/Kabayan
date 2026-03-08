import React, { useEffect, useState } from "react";
import { View, Text, Image, ActivityIndicator, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { supabaseClient } from "@/utils/supabase";
import { useRouter } from "expo-router";

type ProfileRow = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  job_role: string | null;
  id_verification_status: string;
  location_label: string | null;
  created_at: string;
};

export default function ProfileView() {
  const { t } = useTheme();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data: userData } = await supabaseClient.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) {
        setLoading(false);
        return;
      }
      const { data } = await supabaseClient
        .from("profiles")
        .select("user_id,display_name,avatar_url,job_role,id_verification_status,location_label,created_at")
        .eq("user_id", uid)
        .single();
      if (active) {
        setProfile(data ?? null);
        setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const badgeColor =
    profile?.id_verification_status === "verified"
      ? "#10b981"
      : profile?.id_verification_status === "pending_review"
      ? "#f59e0b"
      : "#94a3b8";

  if (loading) {
    return (
      <View className={`flex-1 items-center justify-center ${t.bgPage}`}>
        <ActivityIndicator />
        <Text className={`mt-2 ${t.textMuted}`}>Loading profile…</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View className={`flex-1 items-center justify-center ${t.bgPage}`}>
        <Text className={`text-base font-semibold ${t.text}`}>No profile found</Text>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${t.bgPage} p-6`}>
      <View className={`p-5 rounded-3xl ${t.bgCard} border ${t.border} shadow-sm`}>
        <View className="flex-row items-center">
          <Image
            source={{
              uri:
                profile.avatar_url ??
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
            }}
            className="w-16 h-16 rounded-2xl"
          />
          <View className="ml-4 flex-1">
            <View className="flex-row items-center">
              <Text className={`text-xl font-black tracking-tight ${t.text}`}>
                {profile.display_name ?? "New User"}
              </Text>
              <View
                className="flex-row items-center ml-2 px-2 py-1 rounded-lg"
                style={{ backgroundColor: `${badgeColor}1A` }}
              >
                <Ionicons
                  name={profile.id_verification_status === "verified" ? "shield-checkmark" : "shield-half"}
                  size={16}
                  color={badgeColor}
                />
                <Text className="ml-1 text-[11px] font-bold" style={{ color: badgeColor }}>
                  {profile.id_verification_status.replace("_", " ")}
                </Text>
              </View>
            </View>
            <Text className={`text-sm ${t.textMuted}`}>
              {profile.job_role ?? "Worker"} • {profile.location_label ?? "Location unknown"}
            </Text>
          </View>
        </View>

        <View className={`mt-4 p-4 rounded-2xl ${t.bgSurface} border ${t.border}`}>
          <Text className={`text-xs font-bold ${t.textMuted} uppercase tracking-[2px] mb-2`}>
            Verification Status
          </Text>
          <Text className={`${t.text}`}>
            {profile.id_verification_status === "verified"
              ? "All required documents were approved."
              : profile.id_verification_status === "pending_review"
              ? "Documents submitted. Awaiting review."
              : "Not verified. Upload permits to earn the badge."}
          </Text>
        </View>

        <TouchableOpacity
          className="mt-4 bg-blue-600 py-3 rounded-2xl items-center"
          onPress={() => router.push("/marketPlace/marketPlaceView?openModal=true")}
          activeOpacity={0.85}
        >
          <Text className="text-white font-black">Open Store / Add Item</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
