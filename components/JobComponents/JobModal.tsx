import React, { useState } from "react";
import { Modal, SafeAreaView, View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { supabaseClient } from "@/utils/supabase";

type JobModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export default function JobModal({ visible, onClose, onCreated }: JobModalProps) {
  const { t } = useTheme();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [requirements, setRequirements] = useState("");
  const [saving, setSaving] = useState(false);

  const clearForm = () => {
    setTitle("");
    setDescription("");
    setLocation("");
    setBudgetMin("");
    setBudgetMax("");
    setRequirements("");
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    await supabaseClient.from("jobs").insert({
      title,
      description,
      location_label: location,
      budget_min: Number(budgetMin) || 0,
      budget_max: Number(budgetMax) || 0,
      requirements: requirements ? requirements.split(",").map((r) => r.trim()) : [],
      status: "open",
      is_urgent: false,
    });
    setSaving(false);
    clearForm();
    onCreated?.();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-black/50 justify-end">
        <View className={`max-h-[80%] bg-white rounded-t-[32px] p-6 ${t.bgCard}`}>
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-2xl bg-blue-100 items-center justify-center mr-3">
                <Feather name="briefcase" size={20} color="#2563eb" />
              </View>
              <View>
                <Text className="text-xl font-black text-slate-900">Create Job Post</Text>
                <Text className="text-xs text-slate-500">List what you need—skills, credentials, and scope.</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#475569" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Field
              label="Job title"
              placeholder="e.g. Master Plumber needed for leak repair"
              value={title}
              onChangeText={setTitle}
              icon="edit-3"
            />
            <Field
              label="Location"
              placeholder="City or exact address"
              value={location}
              onChangeText={setLocation}
              icon="map-pin"
            />
            <Field
              label="Budget range (PHP)"
              placeholder="Minimum"
              value={budgetMin}
              onChangeText={setBudgetMin}
              icon="currency-php"
              inline
              trailing={
                <TextInput
                  keyboardType="numeric"
                  placeholder="Maximum"
                  placeholderTextColor="#94A3B8"
                  value={budgetMax}
                  onChangeText={setBudgetMax}
                  className="ml-3 flex-1 text-base font-semibold text-slate-900"
                  style={{ paddingVertical: 0 }}
                />
              }
            />
            <Field
              label="What’s the work?"
              placeholder="Describe the job, tools needed, schedule, scope…"
              value={description}
              onChangeText={setDescription}
              icon="file-text"
              multiline
            />
            <Field
              label="Requirements"
              placeholder="e.g. Plumbing license, TESDA cert, photos of past work"
              value={requirements}
              onChangeText={setRequirements}
              icon="check-square"
            />

            <View className="mt-5">
              <Text className="text-[11px] font-black text-slate-500 uppercase tracking-[1.5px] mb-2">
                Tips like Indeed
              </Text>
              <Text className="text-slate-600 leading-5">
                Be specific about qualifications (certifications, years of experience, diploma), tools needed, and when the work should start. Clear posts attract better applicants.
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className="mt-6 bg-blue-600 h-14 rounded-2xl items-center justify-center shadow-lg shadow-blue-500/30"
              activeOpacity={0.9}
            >
              <Text className="text-white font-black uppercase text-base tracking-widest">
                {saving ? "Saving…" : "Post Job"}
              </Text>
            </TouchableOpacity>
            <View className="h-4" />
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  icon: keyof typeof Feather.glyphMap;
  multiline?: boolean;
  inline?: boolean;
  trailing?: React.ReactNode;
};

function Field({ label, value, onChangeText, placeholder, icon, multiline, inline, trailing }: FieldProps) {
  return (
    <View className="mb-4">
      <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 mb-2 ml-1">{label}</Text>
      <View className={`flex-row items-center px-4 rounded-2xl border border-slate-200 bg-slate-50 ${multiline ? "py-3" : "h-14"}`}>
        <Feather name={icon} size={18} color="#475569" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          multiline={multiline}
          className="flex-1 ml-3 font-semibold text-slate-900"
          style={multiline ? { minHeight: 80 } : undefined}
        />
        {inline && trailing}
      </View>
    </View>
  );
}
