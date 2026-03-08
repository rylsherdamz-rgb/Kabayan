import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useTheme } from '@/hooks/useTheme';
import { supabaseClient } from '@/utils/supabase';

type ProfileSummary = {
  display_name: string | null;
  id_verification_status: string;
  location_label: string | null;
};

export default function Profile () {
  const { t, toggleTheme } = useTheme();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const { data: userData, error: userError } = await supabaseClient.auth.getUser();
        if (userError) throw new Error(userError.message);

        const uid = userData.user?.id;
        if (!uid) {
          if (active) setLoading(false);
          return;
        }

        const { data, error } = await supabaseClient
          .rpc("rpc_get_profile_summary", { p_user_id: uid })
          .maybeSingle();

        if (error) throw new Error(error.message);
        if (active) setProfile(data);
      } catch (err) {
        if (active) {
          const message = err instanceof Error ? err.message : "Failed to load profile.";
          Alert.alert("Profile Error", message);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw new Error(error.message);
      router.replace("/AuthenticationPage");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to sign out.";
      Alert.alert("Sign Out Failed", message);
    } finally {
      setSigningOut(false);
    }
  };

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
              <View className="flex-1 pr-3">
                <View className="flex-row items-center">
                  <Text className={`text-xl font-black ${t.text}`}>
                    {profile?.display_name ?? "Guest User"}
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
              <View className="items-end gap-2">
                <TouchableOpacity className="px-3 py-2 rounded-xl border border-slate-200" onPress={toggleTheme}>
                  <Ionicons name={t.isDarkMode ? "moon" : "sunny"} size={18} color={t.icon} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/profile/ProfiletView")}
                  className="px-3 py-2 rounded-xl border border-slate-200"
                >
                  <Text className="text-xs font-bold text-slate-700">View</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="mt-4 gap-3">
            <SettingButton
              label="Edit profile"
              icon="create-outline"
              onPress={() => router.push("/profile/EditProfile")}
            />
            <SettingButton
              label="Open your store"
              icon="storefront-outline"
              onPress={() => router.push("/marketPlace/marketPlaceView")}
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
            <SettingButton
              label="Job applicants"
              icon="people-outline"
              onPress={() => router.push("/profile/JobApplicants")}
            />
            <SettingButton
              label="Connect with people"
              icon="person-add-outline"
              onPress={() => router.push("/profile/PeopleConnect")}
            />
            <SettingButton
              label={signingOut ? "Signing out..." : "Sign out"}
              icon="log-out-outline"
              onPress={handleSignOut}
            />
          </View>
        </View>
      )}
    </View>
  );
}

function SettingButton({ label, icon, onPress }: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-sm"
      activeOpacity={0.85}
    >
      <View className="flex-row items-center">
        <Ionicons name={icon} size={20} color="#2563eb" />
        <Text className="ml-3 text-base font-semibold text-slate-900">{label}</Text>
      </View>
      <Feather name="chevron-right" size={18} color="#94A3B8" />
    </TouchableOpacity>
  );
}
