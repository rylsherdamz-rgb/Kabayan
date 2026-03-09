import React, { useEffect, useState } from 'react';
import { View, Pressable, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { supabaseClient } from '@/utils/supabase';
import humanizeError from '@/utils/humanizeError';

type DrawerProfile = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  id_verification_status: string;
  job_role: string;
  market_role: string;
  location_label: string | null;
};

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400';

const titleCase = (value?: string | null) => {
  if (!value) return '';
  return value
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
};

const isAuthSessionMissing = (message?: string | null) =>
  (message ?? '').toLowerCase().includes('auth session missing');

export default function CustomDrawerContent(props: any) {
  const { t } = useTheme();
  const [showModal, setShowModal] = useState<boolean>()
  const inset = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<DrawerProfile | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [jobsCount, setJobsCount] = useState(0);
  const [listingsCount, setListingsCount] = useState(0);
  const [trigger, setTrigger] = useState<any>()

  useEffect(() => {
    let active = true;

    const loadDrawerData = async () => {
      if (active) setLoading(true);
      try {
        const { data: userData, error: userError } = await supabaseClient.auth.getUser();
        if (userError && !isAuthSessionMissing(userError.message)) {
          throw new Error(userError.message);
          setTrigger(userError?.message)
        }

        const user = userData?.user;
        setEmail(user?.email ?? null);
        if (!user) {
          if (active) {
            setProfile(null);
            setJobsCount(0);
            setListingsCount(0);
            setLoading(false);
          }
          return;
        }

        const uid = user.id;

        const [profileRes, jobsRes, listingsRes] = await Promise.all([
          supabaseClient
            .rpc('rpc_get_drawer_profile', { p_user_id: uid })
            .maybeSingle(),
          supabaseClient.rpc('rpc_get_jobs_count_by_employer', { p_employer_id: uid }),
          supabaseClient.rpc('rpc_get_listings_count_by_vendor', { p_vendor_id: uid }),
        ]);

        if (!active) return;

        if (profileRes.error) throw new Error(profileRes.error.message);
        if (jobsRes.error) throw new Error(jobsRes.error.message);
        if (listingsRes.error) throw new Error(listingsRes.error.message);

        setProfile(profileRes.data ?? null);
        setJobsCount(Number(jobsRes.data ?? 0));
        setListingsCount(Number(listingsRes.data ?? 0));
      } catch (err) {
        if (active) {
          const message = humanizeError(err, 'Failed to load drawer data.');
          Alert.alert('Drawer Error', message);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    

    loadDrawerData();
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(() => {
      loadDrawerData();
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleNavigation = ( ) => {
  if (isAuthSessionMissing(trigger) ) {
    setShowModal(true)
  }
  router.push('/profile')

  }

  const displayName = profile?.display_name?.trim() || 'Guest User';
  const verificationStatus = profile?.id_verification_status ?? 'unverified';
  const verificationLabel = titleCase(verificationStatus);
  const isVerified = verificationStatus === 'verified';
  const locationLabel = profile?.location_label ?? 'Location unknown';

  const verificationColor = isVerified ? '#3B82F6' : '#94A3B8';

  return (
    <View style={{paddingTop : inset.top}} className={`flex-1  ${t.bgCard}`}>
      <DrawerContentScrollView {...props} scrollEnabled={true} contentContainerStyle={{ paddingTop: 0 }}>
        <Pressable
          onPress={handleNavigation }
          style={{ paddingTop: inset.top + 20 }} 
          className={`px-6 pb-8 border-b rounded-2xl ${t.border} ${t.brandSoft}`} 
        >
          <View className="relative w-20 h-20 mb-4">
            <Image
              source={{ uri: profile?.avatar_url ?? DEFAULT_AVATAR }}
              className="w-full h-full rounded-[24px] border-4 border-white shadow-sm"
            />
            <View className="absolute -bottom-1 -right-1 bg-emerald-500 w-5 h-5 rounded-full border-2 border-white" />
          </View>

          <Text className={`text-2xl font-black tracking-tighter ${t.text}`}>
            {displayName}
          </Text>
          <View className="flex-row items-center mt-1">
            <MaterialCommunityIcons
              name={isVerified ? 'check-decagram' : 'clock-outline'}
              size={14}
              color={verificationColor}
            />
            <Text className={`ml-1 text-[10px] font-bold uppercase tracking-widest ${t.textMuted}`}>
              {verificationLabel}
            </Text>
          </View>
          <Text className={`mt-1 text-xs font-semibold ${t.textMuted}`}>{locationLabel}</Text>
          {email ? <Text className={`mt-1 text-[11px] ${t.textMuted}`}>{email}</Text> : null}
          <View className="mt-4 flex-row gap-2">
            <View className={`flex-1 ${t.bgCard} border ${t.border} rounded-xl px-3 py-2`}>
              <Text className={`text-[10px] font-black uppercase tracking-widest ${t.textMuted}`}>Jobs</Text>
              <Text className={`text-base font-black ${t.text}`}>{jobsCount}</Text>
            </View>
            <View className={`flex-1 ${t.bgCard} border ${t.border} rounded-xl px-3 py-2`}>
              <Text className={`text-[10px] font-black uppercase tracking-widest ${t.textMuted}`}>Listings</Text>
              <Text className={`text-base font-black ${t.text}`}>{listingsCount}</Text>
            </View>
          </View>
        </Pressable>

        {loading ? (
          <View className="py-6 items-center">
            <ActivityIndicator />
            <Text className={`mt-2 text-xs ${t.textMuted}`}>Loading drawer…</Text>
          </View>
        ) : null}
      </DrawerContentScrollView>
   </View>
  );
}
