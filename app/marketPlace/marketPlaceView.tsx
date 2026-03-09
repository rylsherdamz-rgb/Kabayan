import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from '@/hooks/useTheme';
import MarketModal from '@/components/MarketPlace/MarketModal';
import MarketEditModal from '@/components/MarketPlace/MarketEditModal';
import { supabaseClient } from '@/utils/supabase';
import AppFlashMessage from '@/components/CustomComponents/AppFlashMessage';
import useFlashMessage from '@/hooks/useFlashMessage';
import humanizeError from '@/utils/humanizeError';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ListingFeedRow = {
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

type ReviewRow = {
  id: string;
  listing_id: string;
  buyer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name: string;
  reviewer_avatar_url: string | null;
};

const toNumber = (value: number | string | null | undefined, fallback = 0) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const normalizeListing = (row: any): ListingFeedRow => ({
  id: row.id,
  vendor_id: row.vendor_id,
  name: row.name,
  description: row.description ?? null,
  category: row.category,
  price: toNumber(row.price, 0),
  location_label: row.location_label,
  image_url: row.image_url ?? null,
  is_open: Boolean(row.is_open),
  created_at: row.created_at,
  avg_rating: toNumber(row.avg_rating, 0),
  review_count: Number(row.review_count ?? 0),
});

const normalizeReview = (row: any): ReviewRow => ({
  id: row.id,
  listing_id: row.listing_id,
  buyer_id: row.buyer_id,
  rating: Number(row.rating ?? 0),
  comment: row.comment ?? null,
  created_at: row.created_at,
  reviewer_name: row.reviewer_name ?? "Community Member",
  reviewer_avatar_url: row.reviewer_avatar_url ?? null,
});

export default function MarketPlaceView() {
  const { t } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets()
  const { flashMessage, showFlashMessage, hideFlashMessage } = useFlashMessage();
  const [showModal, setShowModal] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [listings, setListings] = useState<ListingFeedRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [updatingOpenState, setUpdatingOpenState] = useState(false);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const params = useLocalSearchParams<{ openModal?: string; id?: string }>();

  const loadListings = useCallback(async () => {
    setLoadingListings(true);
    const { data, error } = await supabaseClient.rpc("rpc_get_marketplace_listings_feed");
    if (error) {
      showFlashMessage("Marketplace Error", humanizeError(error, "Unable to load marketplace listings."), "error");
      setLoadingListings(false);
      return;
    }

    const normalized = (data ?? []).map(normalizeListing);
    setListings(normalized);
    setSelectedId((prev) => {
      const requestedId = typeof params.id === "string" ? params.id : null;
      if (requestedId && normalized.some((item) => item.id === requestedId)) return requestedId;
      if (prev && normalized.some((item) => item.id === prev)) return prev;
      return normalized[0]?.id ?? null;
    });
    setLoadingListings(false);
  }, [params.id, showFlashMessage]);

  const loadReviews = useCallback(async (listingId: string) => {
    setLoadingReviews(true);
    const { data, error } = await supabaseClient.rpc("rpc_get_marketplace_reviews", {
      p_listing_id: listingId,
    });
    if (error) {
      showFlashMessage("Reviews Error", humanizeError(error, "Unable to load reviews."), "error");
      setLoadingReviews(false);
      return;
    }
    setReviews((data ?? []).map(normalizeReview));
    setLoadingReviews(false);
  }, [showFlashMessage]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
    const { data: authListener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setCurrentUserId(session?.user?.id ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (params.openModal === "true") {
      setShowModal(true);
    }
  }, [params.openModal]);

  useEffect(() => {
    if (typeof params.id === "string") {
      setSelectedId(params.id);
    }
  }, [params.id]);

  const featured = useMemo(() => {
    if (!listings.length) return null;
    return listings.find((item) => item.id === selectedId) ?? listings[0];
  }, [listings, selectedId]);

  useEffect(() => {
    if (!featured?.id) {
      setReviews([]);
      return;
    }
    loadReviews(featured.id);
  }, [featured?.id, loadReviews]);

  const permitVerified = useMemo(
    () => (featured?.description ?? "").toLowerCase().includes("permit: verified"),
    [featured]
  );

  const vendorItems = useMemo(() => {
    if (!featured) return [];
    const sameVendor = listings.filter((item) => item.vendor_id === featured.vendor_id);
    return sameVendor.length > 0 ? sameVendor : [featured];
  }, [featured, listings]);

  const isOwner = Boolean(currentUserId && featured && featured.vendor_id === currentUserId);

  const handleOpenReviewModal = async () => {
    const { data, error } = await supabaseClient.auth.getUser();
    if (error) {
      showFlashMessage("Auth Error", humanizeError(error, "Unable to verify your session."), "error");
      return;
    }
    if (!data.user) {
      showFlashMessage("Sign in required", "Please sign in before writing a review.", "warning");
      return;
    }
    if (!featured) return;
    setReviewModalVisible(true);
  };

  const handleSubmitReview = async () => {
    if (!featured || submittingReview) return;

    const rating = Math.max(1, Math.min(5, Math.round(reviewRating)));
    setSubmittingReview(true);

    try {
      const { error } = await supabaseClient.rpc("rpc_create_marketplace_review", {
        p_listing_id: featured.id,
        p_rating: rating,
        p_comment: reviewComment.trim() || null,
      });

      if (error) throw new Error(error.message);

      setReviewModalVisible(false);
      setReviewRating(5);
      setReviewComment("");
      await Promise.all([loadListings(), loadReviews(featured.id)]);
      showFlashMessage("Review posted", "Thanks for sharing your feedback.", "success");
    } catch (err) {
      const message = humanizeError(err, "Unable to submit review.");
      showFlashMessage("Review Failed", message, "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleToggleListingOpen = async () => {
    if (!featured || !isOwner || updatingOpenState) return;

    const nextIsOpen = !featured.is_open;
    setUpdatingOpenState(true);
    try {
      const { data, error } = await supabaseClient
        .rpc("rpc_set_marketplace_listing_open_state", {
          p_listing_id: featured.id,
          p_is_open: nextIsOpen,
        })
        .maybeSingle();

      if (error) throw new Error(error.message);
      const resolvedOpen = typeof data?.is_open === "boolean" ? data.is_open : nextIsOpen;
      setListings((prev) =>
        prev.map((item) =>
          item.id === featured.id
            ? {
                ...item,
                is_open: resolvedOpen,
              }
            : item
        )
      );
      showFlashMessage(
        resolvedOpen ? "Listing reopened" : "Listing closed",
        resolvedOpen ? "Customers can now place orders for this item." : "This listing is now closed to new orders.",
        "success"
      );
    } catch (err) {
      const message = humanizeError(err, "Unable to update listing state.");
      showFlashMessage("Update failed", message, "error");
    } finally {
      setUpdatingOpenState(false);
    }
  };

  if (loadingListings) {
    return (
      <View className={`flex-1 items-center justify-center ${t.bgPage}`}>
        <ActivityIndicator />
        <Text className={`mt-2 ${t.textMuted}`}>Loading marketplace…</Text>
      </View>
    );
  }

  if (!featured) {
    return (
      <View style={{paddingBottom: insets.bottom, paddingTop : insets.top}} className={`flex-1 items-center justify-center px-6 ${t.bgPage}`}>
        <AppFlashMessage message={flashMessage} onClose={hideFlashMessage} />
        <Text className={`text-base font-semibold ${t.text}`}>No listings found</Text>
        <TouchableOpacity onPress={() => setShowModal(true)} className="mt-4 bg-blue-600 px-6 py-3 rounded-2xl">
          <Text className="text-white font-black text-xs uppercase tracking-widest">Add Item</Text>
        </TouchableOpacity>

        <MarketModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            loadListings();
          }}
        />
      </View>
    );
  }

  return (
    <View  className={`flex-1 ${t.bgPage}`}>
      <AppFlashMessage message={flashMessage} onClose={hideFlashMessage} />
      <ScrollView style={{marginBottom : insets.top}}  showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop : insets.top}} className="h-72 w-full relative">
          {featured.image_url ? (
            <Image source={{ uri: featured.image_url }} className="w-full h-full" />
          ) : (
            <View className={`w-full h-full items-center justify-center ${t.bgSurface}`}>
              <Feather name="image" size={36} color={t.icon} />
              <Text className={`mt-2 text-sm font-semibold ${t.textMuted}`}>No listing photo</Text>
            </View>
          )}
          <View className="absolute top-4 left-5 right-5 flex-row justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-white/90 p-2.5 rounded-2xl shadow-sm"
            >
              <Feather name="chevron-left" size={24} color="#0F172A" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-white/90 p-2.5 rounded-2xl shadow-sm">
              <Feather name="share-2" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>

        <View className={`-mt-10 px-6 pt-8 pb-32 rounded-t-[40px] ${t.bgCard} border-t ${t.border}`}>
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <View className="flex-row items-center flex-wrap">
                <Text className={`text-3xl font-black tracking-tighter ${t.text}`}>{featured.name}</Text>
                {permitVerified && (
                  <View className="flex-row items-center bg-emerald-100 px-2 py-1 rounded-lg ml-2 mt-1">
                    <Ionicons name="shield-checkmark" size={14} color="#059669" />
                    <Text className="ml-1 text-[10px] font-black text-emerald-700">Permit Verified</Text>
                  </View>
                )}
              </View>
              <View className="flex-row items-center mt-2">
                <View className={`${featured.is_open ? 'bg-emerald-50' : 'bg-rose-50'} px-2 py-1 rounded-md mr-3`}>
                  <Text className={`${featured.is_open ? 'text-emerald-600' : 'text-rose-600'} font-black text-[10px] uppercase`}>
                    {featured.is_open ? "Open" : "Closed"}
                  </Text>
                </View>
                <Ionicons name="star" size={14} color="#F59E0B" />
                {featured.review_count > 0 ? (
                  <>
                    <Text className={`ml-1 text-sm font-bold ${t.text}`}>{featured.avg_rating.toFixed(1)}</Text>
                    <Text className={`ml-1 text-sm font-medium ${t.textMuted}`}>
                      ({featured.review_count} review{featured.review_count === 1 ? "" : "s"})
                    </Text>
                  </>
                ) : (
                  <Text className={`ml-1 text-sm font-medium ${t.textMuted}`}>No reviews yet</Text>
                )}
              </View>
            </View>

            <View className="items-end">
              <Text className={`text-2xl font-black ${t.price}`}>₱{featured.price.toLocaleString()}</Text>
              <Text className={`mt-1 text-xs font-semibold ${t.textMuted}`}>{featured.category}</Text>
            </View>
          </View>

          <View className="flex-row mt-8 gap-x-4">
            <TouchableOpacity onPress={() => router.push({ pathname: "/map/mapView", params: { location: featured.location_label } })}>
              <InfoChip icon="map-pin" label={featured.location_label} t={t} />
            </TouchableOpacity>
            <InfoChip icon="tag" label={featured.category} t={t} />
          </View>

          {isOwner ? (
            <View className="mt-6">
              <Text className={`text-[10px] font-black uppercase tracking-widest ${t.textMuted} mb-3`}>Owner Controls</Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setEditModalVisible(true)}
                  className="flex-1 h-12 rounded-2xl bg-blue-600 items-center justify-center"
                >
                  <Text className="text-white text-xs font-black uppercase tracking-widest">Edit Listing</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleToggleListingOpen}
                  disabled={updatingOpenState}
                  className={`flex-1 h-12 rounded-2xl items-center justify-center ${featured.is_open ? "bg-rose-600" : "bg-emerald-600"}`}
                >
                  <Text className="text-white text-xs font-black uppercase tracking-widest">
                    {updatingOpenState ? "Updating..." : featured.is_open ? "Close Listing" : "Reopen Listing"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          <View className="mt-10">
            <Text className={`text-lg font-black tracking-tight mb-4 ${t.text}`}>More from this vendor</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
              {vendorItems.map((item) => (
                <MenuCard
                  key={item.id}
                  name={item.name}
                  price={`₱${item.price.toLocaleString()}`}
                  img={item.image_url}
                  verified={(item.description ?? "").toLowerCase().includes("permit: verified")}
                  t={t}
                  onPress={() => setSelectedId(item.id)}
                  isActive={item.id === featured.id}
                />
              ))}
            </ScrollView>
          </View>

          <View className="mt-10">
            <View className="flex-row justify-between items-center mb-6">
              <Text className={`text-lg font-black tracking-tight ${t.text}`}>Community Reviews</Text>
              {!isOwner ? (
                <TouchableOpacity onPress={handleOpenReviewModal}>
                  <Text className={`text-xs font-bold ${t.brand}`}>Write a Review</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {loadingReviews ? (
              <View style={{paddingBottom : 20  + insets.bottom}} className="py-8 items-center">
                <ActivityIndicator />
                <Text className={`mt-2 text-xs ${t.textMuted}`}>Loading reviews…</Text>
              </View>
            ) : reviews.length === 0 ? (
              <View className={`p-5 rounded-3xl ${t.bgSurface} border ${t.border}`}>
                <Text className={`text-sm font-semibold ${t.text}`}>No reviews yet</Text>
                <Text className={`text-xs mt-2 ${t.textMuted}`}>Be the first to leave feedback for this listing.</Text>
              </View>
            ) : (
              reviews.map((review) => (
                <ReviewItem key={review.id} review={review} t={t} />
              ))
            )}
          </View>
        </View>
      </ScrollView>

            { isOwner ? (      <View style={{paddingBottom: 10 +  insets.bottom}} className={`absolute bottom-0 left-0 right-0 p-6 ${t.bgCard} border-t ${t.border} flex-row items-center`}>
        <TouchableOpacity onPress={() => setShowModal(true)} className="bg-blue-600 px-10 h-14 rounded-2xl items-center justify-center shadow-lg shadow-blue-500/40">
          <Text className="text-white font-black uppercase text-sm tracking-widest">Add Item</Text>
        </TouchableOpacity>
      </View>

) : null

            }
      <MarketModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onCreated={() => {
          setShowModal(false);
          loadListings();
        }}
      />

      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <KeyboardAvoidingView style={{paddingBottom :insets.bottom}} className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 justify-end">
          <View style={{paddingBottom : insets.bottom}} className="flex-1 bg-black/50 justify-end">
            <View className={`rounded-t-[28px] px-6 pt-6 pb-8 ${t.bgCard}`}>
              <View className="flex-row items-center justify-between mb-5">
                <Text className={`text-xl font-black ${t.text}`}>Write a Review</Text>
                <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                  <Ionicons name="close" size={22} color={t.icon} />
                </TouchableOpacity>
              </View>

              <Text className={`text-xs font-black uppercase tracking-widest ${t.textMuted}`}>Rating</Text>
              <View className="flex-row mt-2 mb-4">
                {[1, 2, 3, 4, 5].map((value) => (
                  <TouchableOpacity key={value} onPress={() => setReviewRating(value)} className="mr-2">
                    <Ionicons
                      name={value <= reviewRating ? "star" : "star-outline"}
                      size={26}
                      color={value <= reviewRating ? "#F59E0B" : "#94A3B8"}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text className={`text-xs font-black uppercase tracking-widest ${t.textMuted}`}>Comment</Text>
              <View className={`mt-2 border ${t.border} rounded-2xl ${t.bgSurface} px-4 py-3`}>
                <TextInput
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  placeholder="Share your experience"
                  placeholderTextColor={t.icon}
                  multiline
                  className={`${t.text}`}
                  style={{ minHeight: 90, textAlignVertical: "top" }}
                />
              </View>

              <TouchableOpacity
                onPress={handleSubmitReview}
                disabled={submittingReview}
                className="mt-6 bg-blue-600 h-12 rounded-2xl items-center justify-center"
              >
                <Text className="text-white font-black uppercase text-xs tracking-widest">
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <MarketEditModal
        visible={editModalVisible}
        listing={featured}
        onClose={() => setEditModalVisible(false)}
        onSaved={(updated) => {
          setListings((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
          showFlashMessage("Listing updated", "Your listing changes are now live.", "success");
        }}
      />
    </View>
  );
}

function InfoChip({ icon, label, t }: any) {
  return (
    <View className={`${t.bgSurface} flex-row items-center px-4 py-2.5 rounded-xl border ${t.border}`}>
      <Feather name={icon} size={14} color={t.accent} />
      <Text className={`ml-2 text-xs font-bold ${t.textMuted}`}>{label}</Text>
    </View>
  );
}

function MenuCard({ name, price, img, verified, t, onPress, isActive }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`mr-4 w-40 rounded-3xl overflow-hidden ${t.bgSurface} border ${isActive ? 'border-blue-500' : t.border}`}
    >
      {img ? (
        <Image source={{ uri: img }} className="h-28 w-full" />
      ) : (
        <View className="h-28 w-full items-center justify-center bg-slate-100">
          <Feather name="image" size={20} color="#94A3B8" />
        </View>
      )}
      <View className="p-3">
        <View className="flex-row items-center">
          <Text className={`font-black text-sm tracking-tight ${t.text}`}>{name}</Text>
          {verified && (
            <MaterialIcons name="verified" size={14} color="#059669" style={{ marginLeft: 4 }} />
          )}
        </View>
        <Text className="text-emerald-600 font-black text-xs mt-1">{price}</Text>
      </View>
    </TouchableOpacity>
  );
}

function ReviewItem({ review, t }: { review: ReviewRow; t: any }) {
  return (
    <View className={`p-5 rounded-3xl ${t.bgSurface} border ${t.border} mb-4`}>
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center flex-1 pr-4">
          {review.reviewer_avatar_url ? (
            <Image source={{ uri: review.reviewer_avatar_url }} className="w-8 h-8 rounded-full mr-2" />
          ) : (
            <View className="w-8 h-8 rounded-full mr-2 bg-slate-200 items-center justify-center">
              <Text className="text-[11px] font-black text-slate-600">{review.reviewer_name.slice(0, 1).toUpperCase()}</Text>
            </View>
          )}
          <Text className={`font-black text-sm ${t.text}`}>{review.reviewer_name}</Text>
        </View>
        <View className="flex-row">
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name={i < review.rating ? "star" : "star-outline"}
              size={12}
              color="#F59E0B"
            />
          ))}
        </View>
      </View>
      {review.comment ? (
        <Text className={`text-xs leading-5 font-medium ${t.textMuted}`}>{review.comment}</Text>
      ) : (
        <Text className={`text-xs leading-5 font-medium italic ${t.textMuted}`}>No written comment.</Text>
      )}
      <Text className={`text-[10px] mt-2 font-semibold ${t.textMuted}`}>{new Date(review.created_at).toLocaleDateString()}</Text>
    </View>
  );
}
