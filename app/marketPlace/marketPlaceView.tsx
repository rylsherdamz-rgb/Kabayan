import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from '@/hooks/useTheme';
import MarketModal from '@/components/MarketPlace/MarketModal';
import { supabaseClient } from '@/utils/supabase';

export default function MarketPlaceView() {
  const { t } = useTheme();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const params = useLocalSearchParams<{ openModal?: string }>();

  useEffect(() => {
    supabaseClient
      .from("marketplace_listings")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => data && setListings(data));
  }, []);

  useEffect(() => {
    if (params.openModal === "true") {
      setShowModal(true);
    }
  }, [params.openModal]);

  const featured = useMemo(() => listings[0], [listings]);
  const permitVerified = useMemo(
    () => (featured?.description ?? "").toLowerCase().includes("permit: verified"),
    [featured]
  );

  return (
    <View className={`flex-1 ${t.bgPage}`}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        <View className="h-72 w-full relative">
          <Image 
            source={{ uri: featured?.image_url ?? 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800' }} 
            className="w-full h-full"
          />
          <View className="absolute top-4 left-5 right-5 flex-row justify-between">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="bg-white/90 p-2.5 rounded-2xl shadow-sm"
            >
              <Feather name="chevron-left" size={24} color="#0F172A" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-white/90 p-2.5 rounded-2xl shadow-sm">
              <Feather name="share-2" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>

        <View className={`-mt-10 px-6 pt-8 pb-32 rounded-t-[40px] ${t.bgCard} border-t ${t.border}`}>
          
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className={`text-3xl font-black tracking-tighter ${t.text}`}>{featured?.name ?? "Your Food Stall"}</Text>
                {permitVerified && (
                  <View className="flex-row items-center bg-emerald-100 px-2 py-1 rounded-lg ml-2">
                    <Ionicons name="shield-checkmark" size={14} color="#059669" />
                    <Text className="ml-1 text-[10px] font-black text-emerald-700">Permit Verified</Text>
                  </View>
                )}
              </View>
              <View className="flex-row items-center mt-2">
                <View className="bg-emerald-50 px-2 py-1 rounded-md mr-3">
                  <Text className="text-emerald-600 font-black text-[10px] uppercase">Open Now</Text>
                </View>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text className={`ml-1 text-sm font-bold ${t.text}`}>4.8</Text>
                <Text className={`ml-1 text-sm font-medium ${t.textMuted}`}>(120+ Reviews)</Text>
              </View>
            </View>
            {featured?.image_url && (
              <Image 
                source={{ uri: featured.image_url }} 
                className="w-16 h-16 rounded-2xl border-2 border-white shadow-lg"
              />
            )}
          </View>

          <View className="flex-row mt-8 gap-x-4">
            <TouchableOpacity onPress={() => router.push({ pathname: "/map/mapView", params: { location: featured?.location_label } })}>
              <InfoChip icon="map-pin" label={featured?.location_label ?? "Location"} t={t} />
            </TouchableOpacity>
            <InfoChip icon="clock" label="15-20 mins" t={t} />
          </View>

          <View className="mt-10">
            <Text className={`text-lg font-black tracking-tight mb-4 ${t.text}`}>Popular Dishes</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
              {(listings.length ? listings : [featured]).filter(Boolean).map((item) => (
                <MenuCard
                  key={item.id}
                  name={item.name}
                  price={`₱${Number(item.price || 0).toLocaleString()}`}
                  img={item.image_url ?? 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=300'}
                  verified={(item.description ?? "").toLowerCase().includes("permit: verified")}
                  t={t}
                />
              ))}
            </ScrollView>
          </View>

          <View className="mt-10">
            <View className="flex-row justify-between items-center mb-6">
              <Text className={`text-lg font-black tracking-tight ${t.text}`}>Community Reviews</Text>
              <Text className={`text-xs font-bold ${t.brand}`}>Write a Review</Text>
            </View>
            
            <ReviewItem 
              user="Maria C." 
              comment="The best Pares in Quiapo! Super lambot ng baka and the soup is very rich. Highly recommended!"
              rating={5}
              t={t}
            />
          </View>

        </View>
      </ScrollView>

      <View className={`absolute bottom-0 left-0 right-0 p-6 ${t.bgCard} border-t ${t.border} flex-row items-center`}>
        <View className="flex-1">
          <Text className={`text-[10px] font-black uppercase tracking-widest ${t.textMuted}`}>Est. Total</Text>
          <Text className={`text-2xl font-black ${t.text}`}>₱120.00</Text>
        </View>
        <TouchableOpacity onPress={() => setShowModal(true)} className="bg-blue-600 px-10 h-14 rounded-2xl items-center justify-center shadow-lg shadow-blue-500/40">
          <Text className="text-white font-black uppercase text-sm tracking-widest">Add Item</Text>
        </TouchableOpacity>
      </View>

      <MarketModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onCreated={() => {
          setShowModal(false);
          supabaseClient
            .from("marketplace_listings")
            .select("*")
            .order("created_at", { ascending: false })
            .then(({ data }) => data && setListings(data));
        }}
      />
    </View>
  );
}

function InfoChip({ icon, label, t }: any) {
  return (
    <View className={`${t.bgSurface} flex-row items-center px-4 py-2.5 rounded-xl border ${t.border}`}>
      <Feather name={icon} size={14} color={t.accent} />
      <Text className={`ml-2 text-xs font-bold ${t.textMuted}`}>{label}</Text>
    </View>
  );
}

function MenuCard({ name, price, img, verified, t } : any) {
  return (
    <TouchableOpacity className={`mr-4 w-40 rounded-3xl overflow-hidden ${t.bgSurface} border ${t.border}`}>
      <Image source={{ uri: img }} className="h-28 w-full" />
      <View className="p-3">
        <View className="flex-row items-center">
          <Text className={`font-black text-sm tracking-tight ${t.text}`}>{name}</Text>
          {verified && (
            <MaterialIcons name="verified" size={14} color="#059669" style={{ marginLeft: 4 }} />
          )}
        </View>
        <Text className="text-emerald-600 font-black text-xs mt-1">{price}</Text>
      </View>
    </TouchableOpacity>
  );
}

function ReviewItem({ user, comment, rating, t } : any) {
  return (
    <View className={`p-5 rounded-3xl ${t.bgSurface} border ${t.border} mb-4`}>
      <View className="flex-row justify-between items-center mb-2">
        <Text className={`font-black text-sm ${t.text}`}>{user}</Text>
        <View className="flex-row">
          {[...Array(rating)].map((_, i) => (
            <Ionicons key={i} name="star" size={12} color="#F59E0B" />
          ))}
        </View>
      </View>
      <Text className={`text-xs leading-5 font-medium ${t.textMuted}`}>{comment}</Text>
    </View>
  );
}
