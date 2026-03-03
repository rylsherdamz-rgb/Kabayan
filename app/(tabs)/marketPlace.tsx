import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LegendList } from '@legendapp/list';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

const CATEGORIES = ['All', 'Street Food', 'Kakanin', 'Ulam', 'Desserts'];

const VENDORS = [
  {
    id: '1',
    name: "Aling Nena's Special Isaw",
    category: 'Street Food',
    rating: 4.8,
    distance: '350m',
    location: 'Recto Ave, Manila',
    price: '₱',
    vendorImg: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=200',
    bannerImg: 'https://images.unsplash.com/photo-1562601519-1bb440ed7333?w=600',
  }
];

export default function MarketPlace() {
  const { t } = useTheme();
  const [activeTab, setActiveTab] = useState('All');

  return (
    <View className={`flex-1 ${t.bgPage}`}>
      <View className={`pt-12 pb-4 px-5 ${t.bgCard} border-b ${t.border}`}>
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className={`text-2xl font-black tracking-tighter ${t.text}`}>Marketplace</Text>
            <Text className={`${t.textMuted} text-[10px] font-bold uppercase tracking-widest`}>Fresh Community Food</Text>
          </View>
          <TouchableOpacity className={`${t.brandSoft} p-2 rounded-2xl`}>
            <Ionicons name="search" size={20} color={t.accent} />
          </TouchableOpacity>
        </View>
        
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

      <LegendList
        data={VENDORS}
        keyExtractor={(item) => item.id}
        estimatedItemSize={300}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <VendorCard vendor={item} t={t} />
        )}
      />
    </View>
  );
}

function VendorCard({ vendor, t }) {
  return (
    <TouchableOpacity activeOpacity={0.95} className={`rounded-[32px] overflow-hidden mb-6 ${t.bgCard} border ${t.border} shadow-sm`}>
      <View className="h-36 w-full relative">
        <Image source={{ uri: vendor.bannerImg }} className="w-full h-full" />
        <View className="absolute top-4 right-4 bg-white/95 px-2 py-1 rounded-xl flex-row items-center shadow-sm">
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text className="text-[11px] font-black ml-1 text-slate-900">{vendor.rating}</Text>
        </View>
      </View>

      <View className="px-5 pb-6 pt-12 relative">
        <View className="absolute -top-10 left-5">
          <Image 
            source={{ uri: vendor.vendorImg }} 
            className="w-20 h-20 rounded-3xl border-4 border-white shadow-xl" 
          />
        </View>

        <View className="flex-row justify-between items-start">
          <View className="flex-1 pr-4">
            <Text className={`text-xl font-black tracking-tight ${t.text}`}>{vendor.name}</Text>
            <View className="flex-row items-center mt-1">
              <MaterialIcons name="location-on" size={14} color="#3B82F6" />
              <Text className={`text-xs ml-1 font-bold ${t.textMuted}`}>{vendor.location}</Text>
            </View>
          </View>
          <View className={`${t.brandSoft} px-3 py-1.5 rounded-xl`}>
            <Text className={`${t.brand} font-black text-[10px] uppercase`}>{vendor.distance}</Text>
          </View>
        </View>

        <View className={`mt-5 pt-4 border-t ${t.border} flex-row justify-between items-center`}>
          <View className="flex-row items-center">
            <Text className={`font-black mr-2 ${t.price}`}>{vendor.price}</Text>
            <Text className={`text-[10px] font-black uppercase tracking-widest ${t.textMuted}`}>
              • {vendor.category}
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