import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Image,Pressable } from 'react-native';
import {useRouter} from "expo-router"
import { LegendList } from '@legendapp/list';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

const JOBS_POSTED = [
  {
    id: '1',
    title: 'Emergency Pipe Repair',
    company: 'Manila Residences',
    salary: '₱1,500',
    location: 'Makati City',
    type: 'Urgent',
    posted: '2h ago',
  }
];

const TALENT_PROFILES = [
  {
    id: '1',
    name: 'Kuya Jojo',
    skill: 'Master Plumber',
    rating: 4.9,
    jobsDone: 124,
    avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400',
    verified: true,
  }
];

export default function Jobs() {
  const { t } = useTheme();
  const [mode, setMode] = useState('seeker');

  return (
    <View className={`flex-1 ${t.bgPage}`}>
      

      <LegendList data={mode === 'seeker' ? JOBS_POSTED : TALENT_PROFILES}
        keyExtractor={(item) => item.id}
        estimatedItemSize={120}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={({ item }) => (
          mode === 'seeker' ? <JobCard job={item} t={t} /> : <TalentCard talent={item} t={t} />
        )}
      />
    </View>
  );
}

function JobCard({ job, t }) {

  const router  =  useRouter()
  return (
    <Pressable onPress={() => router.push("/job/JobView")} className={`p-5 rounded-[24px] mb-4 ${t.bgCard} border ${t.border} shadow-sm`}>
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <View className="bg-red-50 self-start px-2 py-1 rounded-md mb-2">
            <Text className="text-red-600 font-black text-[9px] uppercase tracking-widest">{job.type}</Text>
          </View>
          <Text className={`text-lg font-black tracking-tight ${t.text}`}>{job.title}</Text>
          <Text className={`text-xs font-bold ${t.brand} mt-1`}>{job.company}</Text>
        </View>
        <Text className="text-emerald-600 font-black text-lg">{job.salary}</Text>
      </View>
      
      <View className={`mt-4 pt-4 border-t ${t.border} flex-row justify-between items-center`}>
        <View className="flex-row items-center">
          <MaterialIcons name="location-on" size={14} color={t.icon} />
          <Text className={`text-[11px] font-bold ml-1 ${t.textMuted}`}>{job.location}</Text>
        </View>
        <Text className={`text-[10px] font-bold ${t.textMuted}`}>{job.posted}</Text>
      </View>
    </Pressable>
  );
}


// for employer
function TalentCard({ talent, t }) {
  return (
    <TouchableOpacity className={`p-4 rounded-[24px] mb-4 ${t.bgCard} border ${t.border} flex-row items-center`}>
      <Image source={{ uri: talent.avatar }} className="w-16 h-16 rounded-2xl mr-4" />
      <View className="flex-1">
        <View className="flex-row items-center">
          <Text className={`text-lg font-black tracking-tight ${t.text}`}>{talent.name}</Text>
          {talent.verified && <MaterialIcons name="verified" size={16} color="#3B82F6" style={{ marginLeft: 4 }} />}
        </View>
        <Text className={`text-xs font-bold ${t.textMuted}`}>{talent.skill}</Text>
        
        <View className="flex-row items-center mt-2">
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text className={`text-[11px] font-black ml-1 ${t.text}`}>4.9</Text>
          <View className={`w-1 h-1 rounded-full mx-2 ${t.bgSurface}`} />
          <Text className={`text-[11px] font-bold ${t.textMuted}`}>{talent.jobsDone} Jobs Done</Text>
        </View>
      </View>
      <TouchableOpacity className={`${t.brandSoft} p-3 rounded-2xl`}>
        <Feather name="message-circle" size={20} color={t.accent} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}