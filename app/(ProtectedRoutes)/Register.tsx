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
  Modal,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Calendar, fromDateId, toDateId } from "@marceloterreiro/flash-calendar";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { supabaseClient } from "@/utils/supabase";
import AppFlashMessage from "@/components/CustomComponents/AppFlashMessage";
import useFlashMessage from "@/hooks/useFlashMessage";
import humanizeError from "@/utils/humanizeError";

const isAuthSessionMissing = (message?: string | null) =>
  (message ?? "").toLowerCase().includes("auth session missing");

const isValidBirthDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime());
};

const TODAY_DATE_ID = toDateId(new Date());

const shiftMonthId = (monthId: string, delta: number) => {
  const nextDate = fromDateId(monthId);
  nextDate.setMonth(nextDate.getMonth() + delta);
  return toDateId(nextDate);
};

const formatBirthDateLabel = (value: string) => {
  if (!isValidBirthDate(value)) return "Select your birth date";
  const [year, month, day] = value.split("-").map((part) => Number(part));
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const getPickedAsset = (result: DocumentPicker.DocumentPickerResult | null) => {
  if (!result || result.canceled || !result.assets.length) return null;
  return result.assets[0];
};

export default function Register() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { flashMessage, showFlashMessage, hideFlashMessage } = useFlashMessage();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthDatePickerOpen, setBirthDatePickerOpen] = useState(false);
  const [birthDateMonthId, setBirthDateMonthId] = useState(TODAY_DATE_ID);
  const [validId, setValidId] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [resume, setResume] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const openBirthDatePicker = () => {
    const initialMonthId = isValidBirthDate(birthDate) ? birthDate : TODAY_DATE_ID;
    setBirthDateMonthId(initialMonthId);
    setBirthDatePickerOpen(true);
  };

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
      className={`flex-1 ${t.bgPage}`}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32, paddingTop: insets.top }}
      >
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
            <View className="mb-4">
              <Text className={`text-[10px] font-black uppercase tracking-widest mb-2 ${t.textMuted}`}>Birth Date</Text>
              <TouchableOpacity
                onPress={openBirthDatePicker}
                className={`h-12 px-4 rounded-2xl border ${t.border} ${t.bgSurface} flex-row items-center justify-between`}
              >
                <Text className={`${birthDate ? t.text : t.textMuted} font-semibold`}>
                  {formatBirthDateLabel(birthDate)}
                </Text>
                <Feather name="calendar" size={16} color={t.icon} />
              </TouchableOpacity>
              {birthDate ? (
                <TouchableOpacity onPress={() => setBirthDate("")} className="self-end mt-2">
                  <Text className="text-[11px] font-semibold text-blue-600">Clear date</Text>
                </TouchableOpacity>
              ) : null}
            </View>

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

      <Modal visible={birthDatePickerOpen} transparent animationType="fade" onRequestClose={() => setBirthDatePickerOpen(false)}>
        <View className="flex-1 bg-black/45 justify-center px-5">
          <View className={`rounded-3xl p-4 border ${t.border} ${t.bgCard}`}>
            <View className="flex-row items-center justify-between mb-3">
              <Text className={`text-base font-black ${t.text}`}>Select Birth Date</Text>
              <TouchableOpacity onPress={() => setBirthDatePickerOpen(false)} className="w-8 h-8 rounded-full items-center justify-center bg-slate-200">
                <Feather name="x" size={16} color="#0f172a" />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center justify-between mb-3">
              <TouchableOpacity
                onPress={() => setBirthDateMonthId((current) => shiftMonthId(current, -1))}
                className={`w-10 h-10 rounded-xl items-center justify-center border ${t.border}`}
              >
                <Feather name="chevron-left" size={18} color={t.icon} />
              </TouchableOpacity>

              <Text className={`text-sm font-bold ${t.text}`}>
                {new Intl.DateTimeFormat("en-US", {
                  month: "long",
                  year: "numeric",
                }).format(fromDateId(birthDateMonthId))}
              </Text>

              <TouchableOpacity
                onPress={() => setBirthDateMonthId((current) => shiftMonthId(current, 1))}
                disabled={shiftMonthId(birthDateMonthId, 1) > TODAY_DATE_ID}
                className={`w-10 h-10 rounded-xl items-center justify-center border ${t.border} ${
                  shiftMonthId(birthDateMonthId, 1) > TODAY_DATE_ID ? "opacity-40" : ""
                }`}
              >
                <Feather name="chevron-right" size={18} color={t.icon} />
              </TouchableOpacity>
            </View>

            <Calendar
              calendarActiveDateRanges={birthDate ? [{ startId: birthDate, endId: birthDate }] : []}
              calendarFirstDayOfWeek="sunday"
              calendarFormatLocale="en-US"
              calendarMaxDateId={TODAY_DATE_ID}
              calendarMonthId={birthDateMonthId}
              onCalendarDayPress={(selectedDateId) => {
                setBirthDate(selectedDateId);
                setBirthDateMonthId(selectedDateId);
                setBirthDatePickerOpen(false);
              }}
            />
          </View>
        </View>
      </Modal>
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
        returnKeyType="done"
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
