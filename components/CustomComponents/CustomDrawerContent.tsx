import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

export default function CustomDrawerContent(props: any) {
  const { t } = useTheme();
  const inset = useSafeAreaInsets();
  const router = useRouter();

  const menuItems = [
    { label: 'Marketplace', icon: 'shopping-bag', route: '/marketPlace' },
    { label: 'Job Board', icon: 'briefcase', route: '/jobs' },
    { label: 'My Wallet', icon: 'credit-card', route: '/wallet' },
    { label: 'Community Forum', icon: 'users', route: '/forum' },
    { label: 'Help & Support', icon: 'help-circle', route: '/support' },
  ];

  return (
    <View className={`flex-1 ${t.bgCard}`}>
      <DrawerContentScrollView {...props} scrollEnabled={true} contentContainerStyle={{ paddingTop: 0 }}>
        
        <View 
          style={{ paddingTop: inset.top + 20 }} 
          className={`px-6 pb-8 border-b ${t.border} ${t.brandSoft}`} 
        >
          <View className="relative w-20 h-20 mb-4">
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400' }}
              className="w-full h-full rounded-[24px] border-4 border-white shadow-sm"
            />
            <View className="absolute -bottom-1 -right-1 bg-emerald-500 w-5 h-5 rounded-full border-2 border-white" />
          </View>
          
          <Text className={`text-2xl font-black tracking-tighter ${t.text}`}>
            Kuya Jojo
          </Text>
          <View className="flex-row items-center mt-1">
            <MaterialCommunityIcons name="check-decagram" size={14} color="#3B82F6" />
            <Text className={`ml-1 text-[10px] font-bold uppercase tracking-widest ${t.textMuted}`}>
              Verified Kabayan
            </Text>
          </View>
        </View>

        <View className="mt-6 px-4">
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index}
              onPress={() => router.push(item.route)}
              className="flex-row items-center p-4 rounded-2xl active:bg-blue-50/50"
            >
              <View className={`${t.bgSurface} p-2.5 rounded-xl mr-4`}>
                <Feather name={item.icon} size={18} color={t.accent} />
              </View>
              <Text className={`text-sm font-bold ${t.text}`}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </DrawerContentScrollView>

      <View 
        style={{ paddingBottom: inset.bottom + 20 }} 
        className={`px-6 pt-6 border-t ${t.border} flex-row items-center justify-between`}
      >
        <View className="flex-row items-center">
          <View className="bg-emerald-100 p-2 rounded-xl mr-3">
             <Feather name="shield" size={16} color="#059669" />
          </View>
          <View>
            <Text className={`text-[10px] font-black uppercase tracking-widest ${t.textMuted}`}>Status</Text>
            <Text className={`text-xs font-black ${t.text}`}>Elite Member</Text> 
          </View>
        </View>
        
        <TouchableOpacity className={`w-12 h-12 ${t.bgSurface} border ${t.border} rounded-2xl items-center justify-center active:bg-rose-50`}>
          <Feather name="log-out" size={20} color="#EF4444" /> 
        </TouchableOpacity>
      </View>
    </View>
  );
}
