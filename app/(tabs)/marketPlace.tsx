import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, RefreshControl } from 'react-native';
import CustomSearchBarComponent from "@/components/CustomComponents/CustomSearchComponent";
import { LegendList } from '@legendapp/list';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { supabaseClient } from '@/utils/supabase';
import { useRouter } from 'expo-router';

const CATEGORIES = ['All', 'Street Food', 'Kakanin', 'Ulam', 'Desserts'];

type ListingFeedRow = {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  location_label: string;
  image_url: string | null;
  is_open: boolean;
  created_at: string;
  avg_rating: number;
  review_count: number;
};

const toNumber = (value: number | string | null | undefined, fallback = 0) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const normalizeListing = (row: any): ListingFeedRow => ({
  id: row.id,
  vendor_id: row.vendor_id,
  name: row.name,
  description: row.description ?? null,
  category: row.category,
  price: toNumber(row.price, 0),
  location_label: row.location_label,
  image_url: row.image_url ?? null,
  is_open: Boolean(row.is_open),
  created_at: row.created_at,
  avg_rating: toNumber(row.avg_rating, 0),
  review_count: Number(row.review_count ?? 0),
});

export default function MarketPlace() {
  const { t } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [listings, setListings] = useState<ListingFeedRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadListings = async () => {
    setLoading(true);
    const { data } = await supabaseClient.rpc("rpc_get_marketplace_listings_feed");
    setListings((data ?? []).map(normalizeListing));
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
        {vendor.image_url ? (
          <Image source={{ uri: vendor.image_url }} className="w-full h-full" />
        ) : (
          <View className={`w-full h-full items-center justify-center ${t.bgSurface}`}>
            <Feather name="image" size={28} color={t.icon} />
            <Text className={`mt-2 text-xs font-semibold ${t.textMuted}`}>No photo uploaded</Text>
          </View>
        )}
        <View className="absolute top-4 right-4 bg-white/95 px-2 py-1 rounded-xl flex-row items-center shadow-sm">
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text className="text-[11px] font-black ml-1 text-slate-900">
            {vendor.review_count > 0 ? vendor.avg_rating.toFixed(1) : "New"}
          </Text>
        </View>
      </View>

      <View className="px-5 pb-6 pt-12 relative">
        <View className="absolute -top-10 left-5">
          {vendor.image_url ? (
            <Image
              source={{ uri: vendor.image_url }}
              className="w-20 h-20 rounded-3xl border-4 border-white shadow-xl"
            />
          ) : (
            <View className="w-20 h-20 rounded-3xl border-4 border-white shadow-xl bg-slate-200 items-center justify-center">
              <Text className="text-slate-600 font-black text-lg">{String(vendor.name ?? "M").slice(0, 1).toUpperCase()}</Text>
            </View>
          )}
        </View>

        <View className="flex-row justify-between items-start">
          <View className="flex-1 pr-4">
            <View className="flex-row items-center">
              <Text className={`text-xl font-black tracking-tight ${t.text}`}>{vendor.name}</Text>
              {verified && <Ionicons name="shield-checkmark" size={14} color="#059669" style={{ marginLeft: 6 }} />}
            </View>
            <View className="flex-row items-center mt-1">
              <MaterialIcons name="location-on" size={14} color="#3B82F6" />
              <Text className={`text-xs ml-1 font-bold ${t.textMuted}`}>{vendor.location_label}</Text>
            </View>
          </View>
          <View className={`${t.brandSoft} px-3 py-1.5 rounded-xl`}>
            <Text className={`${t.brand} font-black text-[10px] uppercase`}>{vendor.review_count} review{vendor.review_count === 1 ? "" : "s"}</Text>
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
