import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { useTheme } from "@/hooks/useTheme";
import { supabaseClient } from "@/utils/supabase";
import humanizeError from "@/utils/humanizeError";

const FALLBACK_COORDINATE = {
  latitude: 14.5995,
  longitude: 120.9842,
};

type EditableListing = {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  location_label: string;
  image_url: string | null;
  is_open: boolean;
  created_at: string;
  avg_rating: number;
  review_count: number;
};

type MarketEditModalProps = {
  visible: boolean;
  listing: EditableListing | null;
  onClose: () => void;
  onSaved: (updated: EditableListing) => void;
};

export default function MarketEditModal({ visible, listing, onClose, onSaved }: MarketEditModalProps) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!listing) return;
    setName(listing.name ?? "");
    setDescription(listing.description ?? "");
    setCategory(listing.category ?? "");
    setPrice(String(listing.price ?? 0));
    setLocation(listing.location_label ?? "");
    setImageUrl(listing.image_url ?? "");
    setError(null);
  }, [listing, visible]);

  const handleSave = async () => {
    if (!listing || saving) return;

    const trimmedName = name.trim();
    const trimmedCategory = category.trim();
    const trimmedLocation = location.trim();
    const trimmedDescription = description.trim();
    const trimmedImageUrl = imageUrl.trim();
    const numericPrice = Number(price);

    if (!trimmedName || !trimmedCategory || !trimmedLocation) {
      setError("Name, category, and location are required.");
      return;
    }

    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      setError("Price must be a valid non-negative number.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      let latitude = FALLBACK_COORDINATE.latitude;
      let longitude = FALLBACK_COORDINATE.longitude;
      try {
        const geocoded = await Location.geocodeAsync(trimmedLocation);
        if (geocoded.length > 0) {
          latitude = geocoded[0].latitude;
          longitude = geocoded[0].longitude;
        }
      } catch {
        // Keep fallback coordinates.
      }

      const { data, error: updateError } = await supabaseClient
        .rpc("rpc_update_marketplace_listing", {
          p_listing_id: listing.id,
          p_name: trimmedName,
          p_description: trimmedDescription || null,
          p_category: trimmedCategory,
          p_price: numericPrice,
          p_location_label: trimmedLocation,
          p_latitude: latitude,
          p_longitude: longitude,
          p_image_url: trimmedImageUrl || null,
          p_is_open: listing.is_open,
        })
        .maybeSingle();

      if (updateError) throw new Error(updateError.message);
      if (!data) throw new Error("No updated listing returned.");

      onSaved({
        id: data.id,
        vendor_id: data.vendor_id,
        name: data.name,
        description: data.description ?? null,
        category: data.category,
        price: Number(data.price ?? numericPrice),
        location_label: data.location_label,
        image_url: data.image_url ?? null,
        is_open: Boolean(data.is_open),
        created_at: data.created_at ?? listing.created_at,
        avg_rating: listing.avg_rating,
        review_count: listing.review_count,
      });
      onClose();
    } catch (err) {
      const message = humanizeError(err, "Failed to update listing.");
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, justifyContent: "flex-end", paddingBottom: insets.bottom }}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className={`max-h-[85%] rounded-t-[30px] px-6 pt-6 pb-4 ${t.bgCard}`}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className={`text-xl font-black ${t.text}`}>Edit Listing</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={22} color={t.icon} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Field label="Item Name" value={name} onChangeText={setName} placeholder="Listing name" icon="tag" />
              <Field label="Category" value={category} onChangeText={setCategory} placeholder="Food, Grocery, Services" icon="grid" />
              <Field label="Price (PHP)" value={price} onChangeText={setPrice} placeholder="0" icon="dollar-sign" keyboardType="numeric" />
              <Field label="Location" value={location} onChangeText={setLocation} placeholder="City / area" icon="map-pin" />
              <Field label="Image URL" value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." icon="image" />
              <Field
                label="Description"
                value={description}
                onChangeText={setDescription}
                placeholder="Description, serving size, and details"
                icon="file-text"
                multiline
              />

              {error ? <Text className="text-xs font-semibold text-red-600">{error}</Text> : null}

              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className={`mt-5 h-12 rounded-2xl items-center justify-center ${saving ? "bg-blue-400" : "bg-blue-600"}`}
              >
                <Text className="text-white text-xs font-black uppercase tracking-widest">
                  {saving ? "Saving..." : "Save Listing Changes"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  multiline = false,
  keyboardType = "default",
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  icon: keyof typeof Feather.glyphMap;
  multiline?: boolean;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View className="mb-4">
      <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</Text>
      <View className={`rounded-2xl border border-slate-200 bg-slate-50 px-4 ${multiline ? "py-3" : "h-12"} flex-row items-start`}>
        <Feather name={icon} size={16} color="#64748B" style={{ marginTop: multiline ? 2 : 12 }} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          multiline={multiline}
          keyboardType={keyboardType}
          className="ml-2 flex-1 text-slate-900 font-semibold"
          style={multiline ? { minHeight: 90, textAlignVertical: "top" } : { height: 48 }}
        />
      </View>
    </View>
  );
}
