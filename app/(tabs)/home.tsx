import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
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
      <View className={`${t.bgCard} pt-12 pb-6 px-[5%] rounded-b-[40px] shadow-sm`}>
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className={`text-xs font-black uppercase tracking-[2px] ${t.textMuted}`}>Welcome back,</Text>
            <Text className={`text-2xl font-black tracking-tight ${t.text}`}>Kuya Jojo</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setUserMode(userMode === 'seeker' ? 'employer' : 'seeker')}
            className={`${t.brandSoft} px-4 py-2 rounded-2xl border ${t.border}`}
          >
            <Text className={`text-[10px] font-black uppercase ${t.brand}`}>
              Switch to {userMode === 'seeker' ? 'Hire' : 'Work'}
            </Text>
          </TouchableOpacity>
        </View>

        <CustomSearchComponent onSearch={() => router.back()} onNavigateToMap={() => router.push('/map')} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-[5%] mt-6">
        <View className="flex-row justify-between mb-8">
          <StatCard 
            label={userMode === 'seeker' ? "Earnings" : "Spent"} 
            value={userMode === 'seeker' ? "₱12,450" : "₱8,200"} 
            icon="wallet-outline" 
            t={t} 
          />
          <StatCard 
            label={userMode === 'seeker' ? "Jobs Done" : "Active Posts"} 
            value={userMode === 'seeker' ? "48" : "3"} 
            icon="briefcase-outline" 
            t={t} 
          />
        </View>

        <View className="mb-6">
          <View className="flex-row justify-between items-end mb-4">
            <Text className={`text-lg font-black tracking-tight ${t.text}`}>
              {userMode === 'seeker' ? "Nearby Opportunities" : "Top Rated Talent"}
            </Text>
            <TouchableOpacity onPress={() => router.push('/jobs')}>
              <Text className={`text-xs font-bold ${t.brand}`}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View className="h-64 rounded-[32px] overflow-hidden border border-slate-200 shadow-lg">
            <CustomMapComponents />
            <View className="absolute bottom-4 left-4 right-4 bg-white/90 p-4 rounded-2xl flex-row items-center justify-between shadow-md">
              <View>
                <Text className="text-[10px] font-black text-slate-400 uppercase">Live Map View</Text>
                <Text className="text-slate-900 font-bold">Find local {userMode === 'seeker' ? 'clients' : 'pros'}</Text>
              </View>
              <TouchableOpacity className="bg-slate-900 p-2 rounded-xl">
                <Feather name="maximize" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
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

function StatCard({ label, value, icon, t }) {
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