import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, RefreshControl } from 'react-native';
import CustomSearchBarComponent from "@/components/CustomComponents/CustomSearchComponent";
import { LegendList } from '@legendapp/list';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { supabaseClient } from '@/utils/supabase';
import { useRouter } from 'expo-router';

const CATEGORIES = ['All', 'Street Food', 'Kakanin', 'Ulam', 'Desserts'];

export default function MarketPlace() {
  const { t } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadListings = async () => {
    setLoading(true);
    const { data } = await supabaseClient
      .from("marketplace_listings")
      .select("id,name,category,price,location_label,image_url,description,created_at")
      .order("created_at", { ascending: false });
    setListings(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadListings();
  }, []);

  const filtered = useMemo(() => {
    if (activeTab === "All") return listings;
    return listings.filter((v) => (v.category ?? "").toLowerCase().includes(activeTab.toLowerCase()));
  }, [listings, activeTab]);

  return (
    <View className={`flex-1 ${t.bgPage}`}>
      <View className={`pt-6 pb-4 px-5 flex flex-col gap-y-3 ${t.bgCard} border-b ${t.border}`}>

        <CustomSearchBarComponent />
       
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat}
              onPress={() => setActiveTab(cat)}
              className={`mr-2 px-6 py-2.5 rounded-2xl border ${activeTab === cat ? 'bg-blue-600 border-blue-600' : `${t.bgSurface} ${t.border}`}`}
            >
              <Text className={`text-[11px] font-black uppercase tracking-tight ${activeTab === cat ? 'text-white' : t.textMuted}`}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className={`mt-2 ${t.textMuted}`}>Loading vendors…</Text>
        </View>
      ) : (
        <LegendList
          data={filtered}
          keyExtractor={(item) => item.id}
          estimatedItemSize={300}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadListings} />}
          ListEmptyComponent={
            <View className="py-16 items-center">
              <Text className={`text-sm ${t.textMuted}`}>No vendors found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <VendorCard vendor={item} t={t} onPress={() => router.push({ pathname: "/marketPlace/marketPlaceView", params: { id: item.id } })} />
          )}
        />
      )}
    </View>
  );
}

function VendorCard({ vendor, t, onPress }: { vendor: any; t: any; onPress: () => void }) {
  const verified = (vendor.description ?? "").toLowerCase().includes("permit: verified");
  return (
    <TouchableOpacity activeOpacity={0.95} className={`rounded-[32px] overflow-hidden mb-6 ${t.bgCard} border ${t.border} shadow-sm`} onPress={onPress}>
      <View className="h-36 w-full relative">
        <Image source={{ uri: vendor.image_url ?? 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800' }} className="w-full h-full" />
        <View className="absolute top-4 right-4 bg-white/95 px-2 py-1 rounded-xl flex-row items-center shadow-sm">
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text className="text-[11px] font-black ml-1 text-slate-900">{vendor.rating ?? "New"}</Text>
        </View>
      </View>

      <View className="px-5 pb-6 pt-12 relative">
        <View className="absolute -top-10 left-5">
          <Image 
            source={{ uri: vendor.image_url ?? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' }} 
            className="w-20 h-20 rounded-3xl border-4 border-white shadow-xl" 
          />
        </View>

        <View className="flex-row justify-between items-start">
          <View className="flex-1 pr-4">
            <View className="flex-row items-center">
              <Text className={`text-xl font-black tracking-tight ${t.text}`}>{vendor.name}</Text>
              {verified && <Ionicons name="shield-checkmark" size={14} color="#059669" style={{ marginLeft: 6 }} />}
            </View>
            <View className="flex-row items-center mt-1">
              <MaterialIcons name="location-on" size={14} color="#3B82F6" />
              <Text className={`text-xs ml-1 font-bold ${t.textMuted}`}>{vendor.location_label ?? "Location TBD"}</Text>
            </View>
          </View>
          <View className={`${t.brandSoft} px-3 py-1.5 rounded-xl`}>
            <Text className={`${t.brand} font-black text-[10px] uppercase`}>{vendor.distance ?? ""}</Text>
          </View>
        </View>

        <View className={`mt-5 pt-4 border-t ${t.border} flex-row justify-between items-center`}>
          <View className="flex-row items-center">
            <Text className={`font-black mr-2 ${t.price}`}>₱{Number(vendor.price || 0).toLocaleString()}</Text>
            <Text className={`text-[10px] font-black uppercase tracking-widest ${t.textMuted}`}>
              • {vendor.category ?? "Food"}
            </Text>
          </View>
          <TouchableOpacity className="bg-slate-900 px-6 py-3 rounded-2xl">
            <Text className="text-white font-black text-[10px] uppercase tracking-widest">View Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
