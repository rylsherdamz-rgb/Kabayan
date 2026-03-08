import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useTheme } from '@/hooks/useTheme';
import { getCurrentUserId } from "@/hooks/useAccountHooks";
import { getProfileByUserId } from "@/utils/localProfiles"; import SettingButton from "@/components/CustomComponents/CustomSetting"
export default function  Profile  ()  {
  const { t, toggleTheme } = useTheme();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () => {
      const uid = getCurrentUserId();
      if (!uid) {
        setLoading(false);
        return;
      }
      setProfile(getProfileByUserId(uid));
      setLoading(false);
    };
    load();
  }, []);

  const badgeColor =
    profile?.id_verification_status === "verified"
      ? "#10b981"
      : profile?.id_verification_status === "pending_review"
      ? "#f59e0b"
      : "#94a3b8";

  return (
    <View className={`flex-1 ${t.bgPage} p-6`}>
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className={`mt-2 ${t.textMuted}`}>Loading…</Text>
        </View>
      ) : (
        <View>
          <View className={`p-5 rounded-3xl ${t.bgCard} border ${t.border} shadow-sm`}>
            <View className="flex-row items-center justify-between">
              <View>
                <View className="flex-row items-center">
                  <Text className={`text-xl font-black ${t.text}`}>
                    {profile?.display_name ?? "New User"}
                  </Text>
                  <View className="flex-row items-center ml-2 px-2 py-1 rounded-lg" style={{ backgroundColor: `${badgeColor}1A` }}>
                    <Ionicons
                      name={profile?.id_verification_status === "verified" ? "shield-checkmark" : "shield-half"}
                      size={16}
                      color={badgeColor}
                    />
                    <Text className="ml-1 text-[11px] font-bold" style={{ color: badgeColor }}>
                      {profile?.id_verification_status ?? "unverified"}
                    </Text>
                  </View>
                </View>
                <Text className={`text-sm ${t.textMuted}`}>{profile?.location_label ?? "Set your location"}</Text>
              </View>
              <TouchableOpacity className="px-3 py-2 rounded-xl border border-slate-200" onPress={toggleTheme}>
                <Ionicons name={t.isDarkMode ? "moon" : "sunny"} size={18} color={t.icon} />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mt-4 gap-3">
            <SettingButton
              label="Open your store"
              icon="storefront-outline"
              onPress={() => router.push({ pathname: "/marketPlace/marketPlaceView", params: { openModal: "false" } })}
            />
            <SettingButton
              label="Add marketplace item"
              icon="add-circle-outline"
              onPress={() => router.push({ pathname: "/marketPlace/marketPlaceView", params: { openModal: "true" } })}
            />
            <SettingButton
              label="Manage verification"
              icon="shield-checkmark-outline"
              onPress={() => router.push("/profile/ProfiletView")}
            />
          </View>
        </View>
      )}
    </View>
  );
}


