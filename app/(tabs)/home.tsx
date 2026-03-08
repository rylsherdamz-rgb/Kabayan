import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import CustomSearchComponent from "@/components/CustomComponents/CustomSearchComponent";
import CustomMapComponents from "@/components/CustomComponents/CustomMapComponents";
import { useTheme } from "@/hooks/useTheme";

export default function Home() {
  const router = useRouter();
  const { t } = useTheme();
  const [userMode, setUserMode] = useState('seeker');

  return (
    <View className={`flex-1 ${t.bgPage}`}>
      <View className={` pt-6  px-[5%]  `}>
        <CustomSearchComponent onSearch={() => router.back()} onNavigateToMap={() => router.push('/map')} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-[5%] mt-6">
        

        <View className="mb-6">
          <View className="flex-row justify-between items-end mb-4">
            <Text className={`text-lg font-black tracking-tight ${t.text}`}>
              {userMode === 'seeker' ? "Nearby Opportunities" : "Top Rated Talent"}
            </Text>
            <TouchableOpacity onPress={() => router.push('/jobs')}>
              <Text className={`text-xs font-bold ${t.brand}`}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <Pressable onPress={() => router.push("/map/mapView")} className="h-64 rounded-[32px] overflow-hidden border border-slate-200 shadow-lg">
            <CustomMapComponents />
          </Pressable>
        </View>

        <View className="mb-10">
          <Text className={`text-lg font-black tracking-tight mb-4 ${t.text}`}>
            {userMode === 'seeker' ? "Featured Gigs" : "Recommended for You"}
          </Text>
          <View className={`p-5 rounded-[32px] ${t.bgCard} border ${t.border} flex-row items-center`}>
             <View className={`${t.brandSoft} w-12 h-12 rounded-2xl items-center justify-center mr-4`}>
                <MaterialCommunityIcons name="lightning-bolt" size={24} color={t.accent} />
             </View>
             <View className="flex-1">
                <Text className={`font-bold ${t.text}`}>
                  {userMode === 'seeker' ? "Urgent Repair needed in Makati" : "Certified Electrician nearby"}
                </Text>
                <Text className={`text-xs ${t.textMuted}`}>Posted 5 mins ago</Text>
             </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ label, value, icon, t } : any) {
  return (
    <View className={`w-[47%] p-5 rounded-[32px] ${t.bgCard} border ${t.border} shadow-sm`}>
      <View className={`${t.brandSoft} w-10 h-10 rounded-2xl items-center justify-center mb-3`}>
        <Ionicons name={icon} size={20} color={t.accent} />
      </View>
      <Text className={`text-[10px] font-black uppercase tracking-widest ${t.textMuted}`}>{label}</Text>
      <Text className={`text-xl font-black mt-1 ${t.text}`}>{value}</Text>
    </View>
  );
}