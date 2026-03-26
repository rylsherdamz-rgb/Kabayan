import React, { useEffect, useState } from 'react';
import { View, Pressable, Text, Image, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { supabaseClient } from '@/utils/supabase';

export default function CustomDrawerContent(props: any) {
  const { t } = useTheme();
  const inset = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) { setLoading(false); return; }
      setEmail(user.email ?? null);
      const { data } = await supabaseClient.rpc('rpc_get_drawer_profile', { p_user_id: user.id }).maybeSingle();
      if (active) { setProfile(data); setLoading(false); }
    };
    loadData();
    return () => { active = false; };
  }, []);

  const DrawerItem = ({ icon, label, onPress, active = false }: any) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.drawerItem,
        active && { backgroundColor: '#E1E7F0' }, // MD3 "Container" color
        pressed && { backgroundColor: 'rgba(0,0,0,0.05)' }
      ]}
    >
      <MaterialCommunityIcons 
        name={icon} 
        size={24} 
        color={active ? '#1B1B1F' : '#44474E'} 
      />
      <Text style={[
        styles.drawerLabel, 
        { color: active ? '#1B1B1F' : '#44474E', fontWeight: active ? '700' : '500' }
      ]}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.bgCard }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        {/* 1. ACCOUNT HEADER SECTION */}
        <View style={[styles.header, { paddingTop: inset.top + 24 }]}>
          <Image
            source={{ uri: profile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: t.text }]}>
              {profile?.display_name || 'Guest User'}
            </Text>
            <Text style={[styles.userEmail, { color: t.textMuted }]}>
              {email}
            </Text>
          </View>
        </View>

        {/* 2. NAVIGATION SECTION */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionHeader, { color: t.textMuted }]}>Account</Text>
          
          <DrawerItem 
            icon="account-circle-outline" 
            label="Profile" 
            onPress={() => router.push('/profile')} 
            active={props.state.index === 0} // Example check
          />
          
          <DrawerItem 
            icon="map-marker-outline" 
            label="Saved Locations" 
            onPress={() => router.push('/locations')} 
          />

          <View style={styles.divider} />
          
          <Text style={[styles.sectionHeader, { color: t.textMuted }]}>Activity</Text>
          
          <DrawerItem 
            icon="briefcase-outline" 
            label={`Jobs (${profile?.jobs_count || 0})`} 
            onPress={() => {}} 
          />
          
          <DrawerItem 
            icon="tag-outline" 
            label={`Listings (${profile?.listings_count || 0})`} 
            onPress={() => {}} 
          />
        </View>
      </DrawerContentScrollView>

      {/* 3. FOOTER SECTION */}
      <View style={[styles.footer, { paddingBottom: inset.bottom + 16 }]}>
        <DrawerItem 
          icon="logout" 
          label="Sign Out" 
          onPress={() => supabaseClient.auth.signOut()} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 28,
    paddingBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 12,
  },
  userInfo: {
    gap: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '400',
  },
  menuSection: {
    paddingHorizontal: 12, // MD3 standard horizontal inset
    marginTop: 8,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56, // MD3 standard height
    paddingHorizontal: 16,
    borderRadius: 28, // Full pill shape
    marginBottom: 4,
  },
  drawerLabel: {
    marginLeft: 12,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginVertical: 12,
    marginHorizontal: 16,
  },
  footer: {
    paddingHorizontal: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 8,
  },
});