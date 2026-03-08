import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Linking, Modal, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  getCameraPermissionsAsync,
  getMicrophonePermissionsAsync,
  requestCameraPermissionsAsync,
  requestMicrophonePermissionsAsync,
} from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useTheme } from "@/hooks/useTheme";

type PermissionKey = "camera" | "microphone" | "mediaLibrary" | "location";

type PermissionLike = {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
};

type PermissionMap = Record<PermissionKey, PermissionLike | null>;

type PermissionMeta = {
  key: PermissionKey;
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
};

const PERMISSIONS: PermissionMeta[] = [
  {
    key: "camera",
    title: "Camera",
    description: "Capture IDs, profile images, and listing photos.",
    icon: "camera",
  },
  {
    key: "microphone",
    title: "Microphone",
    description: "Required when recording video with audio.",
    icon: "mic",
  },
  {
    key: "mediaLibrary",
    title: "Photos / Media",
    description: "Pick existing photos for jobs and marketplace posts.",
    icon: "image",
  },
  {
    key: "location",
    title: "Location",
    description: "Map features and accurate job/listing location.",
    icon: "map-pin",
  },
];

const EMPTY_PERMISSIONS: PermissionMap = {
  camera: null,
  microphone: null,
  mediaLibrary: null,
  location: null,
};

type AppPermissionsModalProps = {
  visible: boolean;
  onDone: () => void;
};

const normalizePermission = (permission: { granted: boolean; canAskAgain: boolean; status: string }): PermissionLike => ({
  granted: permission.granted,
  canAskAgain: permission.canAskAgain,
  status: permission.status,
});

export default function AppPermissionsModal({ visible, onDone }: AppPermissionsModalProps) {
  const { t } = useTheme();
  const [permissions, setPermissions] = useState<PermissionMap>(EMPTY_PERMISSIONS);
  const [checking, setChecking] = useState(false);
  const [requestingKey, setRequestingKey] = useState<PermissionKey | "all" | null>(null);

  const refreshPermissions = useCallback(async () => {
    setChecking(true);
    try {
      const [camera, microphone, mediaLibrary, location] = await Promise.all([
        getCameraPermissionsAsync(),
        getMicrophonePermissionsAsync(),
        ImagePicker.getMediaLibraryPermissionsAsync(),
        Location.getForegroundPermissionsAsync(),
      ]);

      setPermissions({
        camera: normalizePermission(camera),
        microphone: normalizePermission(microphone),
        mediaLibrary: normalizePermission(mediaLibrary),
        location: normalizePermission(location),
      });
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    refreshPermissions();
  }, [visible, refreshPermissions]);

  const requestByKey = async (key: PermissionKey) => {
    switch (key) {
      case "camera":
        return normalizePermission(await requestCameraPermissionsAsync());
      case "microphone":
        return normalizePermission(await requestMicrophonePermissionsAsync());
      case "mediaLibrary":
        return normalizePermission(await ImagePicker.requestMediaLibraryPermissionsAsync());
      case "location":
        return normalizePermission(await Location.requestForegroundPermissionsAsync());
      default:
        return null;
    }
  };

  const requestSingle = async (key: PermissionKey) => {
    setRequestingKey(key);
    try {
      const updatedPermission = await requestByKey(key);
      if (!updatedPermission) return;
      setPermissions((prev) => ({ ...prev, [key]: updatedPermission }));
    } finally {
      setRequestingKey(null);
    }
  };

  const requestAll = async () => {
    setRequestingKey("all");
    try {
      for (const permission of PERMISSIONS) {
        const current = permissions[permission.key];
        if (current?.granted) continue;
        if (current?.canAskAgain === false) continue;
        const updatedPermission = await requestByKey(permission.key);
        if (!updatedPermission) continue;
        setPermissions((prev) => ({ ...prev, [permission.key]: updatedPermission }));
      }
      await refreshPermissions();
    } finally {
      setRequestingKey(null);
    }
  };

  const grantedCount = useMemo(
    () => PERMISSIONS.filter((permission) => permissions[permission.key]?.granted).length,
    [permissions]
  );
  const allGranted = grantedCount === PERMISSIONS.length;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDone}>
      <View className="flex-1 bg-black/45 justify-center px-5">
        <View className={`rounded-3xl p-5 border ${t.border} ${t.bgCard}`}>
          <View className="flex-row items-center justify-between mb-2">
            <Text className={`text-xl font-black ${t.text}`}>Required Permissions</Text>
            <Text className="text-xs font-bold text-blue-600">{grantedCount}/{PERMISSIONS.length} granted</Text>
          </View>
          <Text className={`text-sm mb-4 ${t.textMuted}`}>
            Grant the permissions Kabayan needs for camera, uploads, and location features.
          </Text>

          {checking ? (
            <View className="py-8 items-center">
              <ActivityIndicator />
              <Text className={`mt-2 ${t.textMuted}`}>Checking permissions…</Text>
            </View>
          ) : (
            <View className="gap-y-3">
              {PERMISSIONS.map((permission) => {
                const state = permissions[permission.key];
                const isGranted = !!state?.granted;
                const cannotAskAgain = state?.canAskAgain === false;
                const isRequesting = requestingKey === permission.key || requestingKey === "all";

                return (
                  <View key={permission.key} className={`p-3 rounded-2xl border ${t.border} ${t.bgSurface}`}>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1 pr-3">
                        <View className="w-9 h-9 rounded-xl bg-blue-100 items-center justify-center">
                          <Feather name={permission.icon} size={16} color="#2563EB" />
                        </View>
                        <View className="ml-3 flex-1">
                          <Text className={`font-bold ${t.text}`}>{permission.title}</Text>
                          <Text className={`text-xs ${t.textMuted}`}>{permission.description}</Text>
                        </View>
                      </View>

                      {isGranted ? (
                        <View className="px-2 py-1 rounded-lg bg-emerald-100">
                          <Text className="text-[10px] font-bold text-emerald-700">Granted</Text>
                        </View>
                      ) : cannotAskAgain ? (
                        <TouchableOpacity
                          onPress={() => Linking.openSettings()}
                          className="px-3 py-2 rounded-xl bg-slate-900"
                          activeOpacity={0.8}
                        >
                          <Text className="text-white text-[10px] font-black uppercase">Settings</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={() => requestSingle(permission.key)}
                          className="px-3 py-2 rounded-xl bg-blue-600"
                          activeOpacity={0.85}
                          disabled={isRequesting}
                        >
                          <Text className="text-white text-[10px] font-black uppercase">
                            {isRequesting ? "Requesting" : "Allow"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <TouchableOpacity
            onPress={requestAll}
            disabled={checking || requestingKey !== null}
            className="mt-5 h-12 rounded-2xl bg-blue-600 items-center justify-center"
            activeOpacity={0.9}
          >
            <Text className="text-white font-black uppercase tracking-widest text-xs">
              {requestingKey === "all" ? "Requesting All…" : "Allow All"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDone}
            className={`mt-3 h-12 rounded-2xl border items-center justify-center ${t.border} ${t.bgCard}`}
            activeOpacity={0.85}
          >
            <Text className={`font-black uppercase tracking-widest text-xs ${t.textMuted}`}>
              {allGranted ? "Continue" : "Continue Later"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
