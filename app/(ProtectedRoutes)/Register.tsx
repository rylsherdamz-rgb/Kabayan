import React, { useCallback, useEffect, useState } from "react";
import {useSafeAreaInsets} from "react-native-safe-area-context"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { supabaseClient } from "@/utils/supabase";
import AppFlashMessage from "@/components/CustomComponents/AppFlashMessage";
import useFlashMessage from "@/hooks/useFlashMessage";
import humanizeError from "@/utils/humanizeError";

const isAuthSessionMissing = (message?: string | null) =>
  (message ?? "").toLowerCase().includes("auth session missing");

const insets = useSafeAreaInsets()

const isValidBirthDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime());
};

const getPickedAsset = (result: DocumentPicker.DocumentPickerResult | null) => {
  if (!result || result.canceled || !result.assets.length) return null;
  return result.assets[0];
};

export default function Register() {
  const { t } = useTheme();
  const router = useRouter();
  const { flashMessage, showFlashMessage, hideFlashMessage } = useFlashMessage();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [validId, setValidId] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [resume, setResume] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseClient.auth.getUser();
      if (error) {
        if (!isAuthSessionMissing(error.message)) {
          throw new Error(error.message);
        }
        setUserId(null);
        return;
      }

      setUserId(data.user?.id ?? null);
    } catch (err) {
      const message = humanizeError(err, "Unable to load account.");
      showFlashMessage("Verification Error", message, "error");
    } finally {
      setLoading(false);
    }
  }, [showFlashMessage]);

  useEffect(() => {
    bootstrap();
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(() => {
      bootstrap();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [bootstrap]);

  const pickValidId = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
      copyToCacheDirectory: true,
      multiple: false,
    });
    const asset = getPickedAsset(result);
    if (asset) setValidId(asset);
  };

  const pickResume = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
      multiple: false,
    });
    const asset = getPickedAsset(result);
    if (asset) setResume(asset);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!userId) {
      showFlashMessage("Sign in required", "Please sign in before submitting verification.", "warning");
      return;
    }

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedBirthDate = birthDate.trim();

    if (!trimmedFirst || !trimmedLast) {
      showFlashMessage("Missing name", "First and last name are required.", "warning");
      return;
    }

    if (!validId?.uri) {
      showFlashMessage("Missing valid ID", "Upload a valid ID document to continue.", "warning");
      return;
    }

    if (trimmedBirthDate && !isValidBirthDate(trimmedBirthDate)) {
      showFlashMessage("Invalid birth date", "Use YYYY-MM-DD format.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabaseClient.rpc("rpc_submit_verification", {
        p_first_name: trimmedFirst,
        p_last_name: trimmedLast,
        p_id_photo_uri: validId.uri,
        p_resume_uri: resume?.uri ?? null,
        p_birth_date: trimmedBirthDate || null,
      });
      if (error) throw new Error(error.message);

      showFlashMessage("Submitted", "Your verification request is now pending review.", "success");
      setTimeout(() => {
        router.back();
      }, 500);
    } catch (err) {
      const message = humanizeError(err, "Unable to submit verification.");
      showFlashMessage("Submit Failed", message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className={`flex-1 items-center justify-center ${t.bgPage}`}>
        <ActivityIndicator />
        <Text className={`mt-2 ${t.textMuted}`}>Loading verification form…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className={`flex-1 ${t.bgPage}`}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom, paddingTop: insets.top  }}>
        <View className="h-28 bg-blue-600 w-full relative">
          <TouchableOpacity onPress={() => router.back()} className="absolute top-12 left-5 bg-white/20 p-2 rounded-full">
            <Feather name="chevron-left" size={22} color="white" />
          </TouchableOpacity>
          <View className="absolute bottom-4 left-5">
            <Text className="text-white text-xl font-black">Verification Registration</Text>
            <Text className="text-blue-100 text-xs font-semibold">Submit your details and ID for profile verification.</Text>
          </View>
        </View>

        <View className="px-5 -mt-10">
          <AppFlashMessage message={flashMessage} onClose={hideFlashMessage} />

          <View className={`rounded-3xl p-5 border ${t.border} ${t.bgCard}`}>
            <Field label="First Name" value={firstName} onChangeText={setFirstName} placeholder="Juan" t={t} />
            <Field label="Last Name" value={lastName} onChangeText={setLastName} placeholder="Dela Cruz" t={t} />
            <Field
              label="Birth Date (YYYY-MM-DD)"
              value={birthDate}
              onChangeText={setBirthDate}
              placeholder="1998-01-24"
              t={t}
            />

            <Text className={`text-[10px] font-black uppercase tracking-widest mb-2 ${t.textMuted}`}>Documents</Text>
            <DocButton
              icon="id-card"
              label={validId ? `Valid ID: ${validId.name}` : "Upload Valid ID"}
              onPress={pickValidId}
            />
            <DocButton
              icon="file-text"
              label={resume ? `Resume: ${resume.name}` : "Upload Resume (Optional)"}
              onPress={pickResume}
            />

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              className={`mt-6 h-12 rounded-2xl items-center justify-center ${submitting ? "bg-blue-400" : "bg-blue-600"}`}
            >
              <Text className="text-white font-black uppercase tracking-widest">
                {submitting ? "Submitting..." : "Submit Verification"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  t,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  t: ReturnType<typeof useTheme>["t"];
}) {
  return (
    <View className="mb-4">
      <Text className={`text-[10px] font-black uppercase tracking-widest mb-2 ${t.textMuted}`}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.icon}
        className={`h-12 px-4 rounded-2xl border ${t.border} ${t.bgSurface} ${t.text}`}
      />
    </View>
  );
}

function DocButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-2 h-12 px-4 rounded-2xl border border-slate-300 bg-slate-50 flex-row items-center"
    >
      <Feather name={icon} size={16} color="#334155" />
      <Text className="ml-2 text-xs font-semibold text-slate-700 flex-1" numberOfLines={1}>
        {label}
      </Text>
      <Ionicons name="cloud-upload-outline" size={16} color="#334155" />
    </TouchableOpacity>
  );
}
