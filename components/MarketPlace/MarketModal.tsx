import React, { useState } from "react";
import { Modal, SafeAreaView, View, Text, TextInput, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { supabaseClient } from "@/utils/supabase";
import { useImagePicker } from "@/context/ImagePicker";
import * as Location from "expo-location";

const FALLBACK_COORDINATE = {
  latitude: 14.5995,
  longitude: 120.9842,
};

type MarketModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export default function MarketModal({ visible, onClose, onCreated }: MarketModalProps) {
  const { t } = useTheme();
  const { pickImage, image, setImage } = useImagePicker();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Food");
  const [location, setLocation] = useState("");
  const [backgroundUri, setBackgroundUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allergens, setAllergens] = useState("");
  const [storage, setStorage] = useState("");
  const [permitVerified, setPermitVerified] = useState(false);

  const clearForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCategory("Food");
    setLocation("");
    setImage(null);
    setBackgroundUri(null);
    setAllergens("");
    setStorage("");
    setPermitVerified(false);
    setError(null);
  };

  const handlePickForeground = async () => {
    const asset = await pickImage();
    if (asset) setImage(asset);
  };

  const handlePickBackground = async () => {
    const asset = await pickImage();
    if (asset) setBackgroundUri(asset.uri);
  };

  const handleSave = async () => {
    if (saving) return;
    const trimmedName = name.trim();
    const trimmedCategory = category.trim();
    const trimmedLocation = location.trim();
    const trimmedDescription = description.trim();
    const priceValue = price.trim() === "" ? 0 : Number(price);

    if (!trimmedName || !trimmedCategory || !trimmedLocation) {
      setError("Item name, category, and location are required.");
      return;
    }

    if (Number.isNaN(priceValue) || priceValue < 0) {
      setError("Price must be a valid non-negative number.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabaseClient.auth.getUser();
      if (authError) throw new Error(authError.message);

      const vendorId = authData.user?.id;
      if (!vendorId) {
        throw new Error("You must be signed in to publish an item.");
      }

      let latitude = FALLBACK_COORDINATE.latitude;
      let longitude = FALLBACK_COORDINATE.longitude;
      try {
        const geo = await Location.geocodeAsync(trimmedLocation);
        if (geo.length > 0) {
          latitude = geo[0].latitude;
          longitude = geo[0].longitude;
        }
      } catch {
        // Keep fallback coordinates so the insert remains valid.
      }

      const composedDescription = [
        trimmedDescription,
        allergens ? `Allergens: ${allergens.trim()}` : "",
        storage ? `Storage: ${storage.trim()}` : "",
        `Permit: ${permitVerified ? "Verified" : "Not verified"}`,
      ]
        .filter(Boolean)
        .join("\n");

      const { error: insertError } = await supabaseClient.rpc("rpc_create_marketplace_listing", {
        p_vendor_id: vendorId,
        p_name: trimmedName,
        p_description: composedDescription || null,
        p_category: trimmedCategory,
        p_price: priceValue,
        p_location_label: trimmedLocation,
        p_latitude: latitude,
        p_longitude: longitude,
        p_image_url: image?.uri ?? null,
        p_is_open: true,
      });

      if (insertError) throw new Error(insertError.message);

      clearForm();
      onCreated?.();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to publish item.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 justify-end">
        <SafeAreaView className="flex-1 bg-black/50 justify-end">
          <View className={`max-h-[85%] bg-white rounded-t-[32px] p-6 ${t.bgCard}`}>
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-2xl bg-emerald-100 items-center justify-center mr-3">
                  <Feather name="shopping-bag" size={20} color="#059669" />
                </View>
                <View>
                  <Text className="text-xl font-black text-slate-900">Add Marketplace Item</Text>
                  <Text className="text-xs text-slate-500">Food or products with photos and price.</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={22} color="#475569" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Field
                label="Item name"
                placeholder="e.g. Chicken Inasal Barkada"
                value={name}
                onChangeText={setName}
                icon="edit-3"
              />
              <Field
                label="Category"
                placeholder="Food, Beverage, Grocery"
                value={category}
                onChangeText={setCategory}
                icon="tag"
              />
              <Field
                label="Price (PHP)"
                placeholder="e.g. 120"
                value={price}
                onChangeText={setPrice}
                icon="currency-php"
              />
              <Field
                label="Location"
                placeholder="Pickup or delivery area"
                value={location}
                onChangeText={setLocation}
                icon="map-pin"
              />
              <Field
                label="Description"
                placeholder="What is this dish/product? Ingredients, serving size, allergens, prep time."
                value={description}
                onChangeText={setDescription}
                icon="file-text"
                multiline
              />
              <Field
                label="Allergens / Warnings"
                placeholder="e.g. Contains peanuts, dairy. Prepared in shared kitchen."
                value={allergens}
                onChangeText={setAllergens}
                icon="alert-triangle"
                multiline
              />
              <Field
                label="Storage & Expiry"
                placeholder="Best consumed within 24h. Keep refrigerated."
                value={storage}
                onChangeText={setStorage}
                icon="clock"
                multiline
              />

              <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 mb-2 ml-1">Photos</Text>
              <View className="flex-row gap-3 mb-4">
                <TouchableOpacity onPress={handlePickForeground} className="flex-1 h-36 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 items-center justify-center">
                  {image?.uri ? (
                    <Image source={{ uri: image.uri }} className="w-full h-full rounded-2xl" />
                  ) : (
                    <Text className="text-emerald-700 font-semibold">Add item photo</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePickBackground} className="flex-1 h-36 rounded-2xl border border-dashed border-blue-300 bg-blue-50 items-center justify-center">
                  {backgroundUri ? (
                    <Image source={{ uri: backgroundUri }} className="w-full h-full rounded-2xl" />
                  ) : (
                    <Text className="text-blue-700 font-semibold">Add banner</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View className="mt-2">
                <Text className="text-[11px] font-black text-slate-500 uppercase tracking-[1.5px] mb-2">Describe like Indeed</Text>
                <Text className="text-slate-600 leading-5">
                  Include serving size, allergens, storage/expiry, and delivery/pickup times. Clear details help buyers decide faster.
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setPermitVerified((v) => !v)}
                className="mt-4 flex-row items-center justify-between px-4 py-3 rounded-2xl border border-emerald-200 bg-emerald-50"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <Ionicons name="shield-checkmark" size={20} color="#059669" />
                  <Text className="ml-2 text-emerald-800 font-semibold">Permit verified (mayor’s permit / sanitation)</Text>
                </View>
                <View className={`w-6 h-6 rounded-full ${permitVerified ? "bg-emerald-600" : "bg-white"} border border-emerald-400`} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className="mt-6 bg-emerald-600 h-14 rounded-2xl items-center justify-center shadow-lg shadow-emerald-500/30"
                activeOpacity={0.9}
              >
                <Text className="text-white font-black uppercase text-base tracking-widest">
                  {saving ? "Saving…" : "Publish Item"}
                </Text>
              </TouchableOpacity>
              {error && (
                <Text className="mt-3 text-red-500 text-sm font-semibold">{error}</Text>
              )}
              <View className="h-6" />
            </ScrollView>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
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
};

function Field({ label, value, onChangeText, placeholder, icon, multiline }: FieldProps) {
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
      </View>
    </View>
  );
}
