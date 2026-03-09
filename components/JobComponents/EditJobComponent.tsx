import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { LegendList } from '@legendapp/list';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

const EDIT_SECTIONS = [
  { id: 'details', title: 'Job Details', icon: 'edit-3' },
  { id: 'payment', title: 'Budget & Pay', icon: 'dollar-sign' },
  { id: 'location', title: 'Work Location', icon: 'map-pin' },
  { id: 'visibility', title: 'Post Visibility', icon: 'eye' },
];

export default function EditJobComponent() {
  const { t } = useTheme();
  const [isUrgent, setIsUrgent] = useState(true);

  return (
    <View className={`flex-1 ${t.bgPage}`}>
      <View className={`${t.bgCard} pt-12 pb-6 px-6 rounded-b-[40px] shadow-sm border-b ${t.border}`}>
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity className={`${t.bgSurface} p-2.5 rounded-2xl`}>
            <Feather name="chevron-left" size={20} color={t.text} />
          </TouchableOpacity>
          <Text className={`text-lg font-black tracking-tight ${t.text}`}>Edit Posting</Text>
          <TouchableOpacity>
            <Text className="text-red-500 font-bold text-xs uppercase">Delete</Text>
          </TouchableOpacity>
        </View>

        <View className={`${t.brandSoft} p-5 rounded-3xl border border-blue-100`}>
          <Text className={`text-[10px] font-black uppercase tracking-[2px] ${t.brand} mb-1`}>Active Preview</Text>
          <Text className={`text-xl font-black tracking-tight ${t.text}`}>Emergency Pipe Repair</Text>
          <View className="flex-row items-center mt-2">
            <Text className="text-emerald-600 font-bold">₱1,500</Text>
            <View className="w-1 h-1 rounded-full bg-slate-300 mx-2" />
            <Text className={`text-xs font-bold ${t.textMuted}`}>Makati City</Text>
          </View>
        </View>
      </View>

      <LegendList
        data={EDIT_SECTIONS}
        keyExtractor={(item) => item.id}
        estimatedItemSize={80}
        contentContainerStyle={{ padding: 24 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            className={`flex-row items-center p-5 mb-4 rounded-[28px] ${t.bgCard} border ${t.border} shadow-sm`}
          >
            <View className={`${t.bgSurface} p-3 rounded-2xl mr-4`}>
              <Feather name={item.icon} size={18} color={t.accent} />
            </View>
            <View className="flex-1">
              <Text className={`font-black text-sm tracking-tight ${t.text}`}>{item.title}</Text>
              <Text className={`text-[10px] font-bold uppercase ${t.textMuted}`}>Modify settings</Text>
            </View>
            <Feather name="chevron-right" size={18} color={t.icon} />
          </TouchableOpacity>
        )}
      />

      <View className="px-6 mb-10">
        <View className={`p-6 rounded-[32px] ${t.bgCard} border ${t.border} flex-row items-center justify-between`}>
          <View className="flex-1 pr-4">
            <Text className={`font-black text-sm ${t.text}`}>Mark as Urgent</Text>
            <Text className={`text-[10px] font-bold ${t.textMuted}`}>Boost this post to the top of the list</Text>
          </View>
          <Switch 
            value={isUrgent} 
            onValueChange={setIsUrgent}
            trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
          />
        </View>

        <TouchableOpacity className="bg-blue-600 h-16 rounded-3xl items-center justify-center mt-6 shadow-xl shadow-blue-500/30">
          <Text className="text-white font-black uppercase tracking-widest">Update Live Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
