import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { supabaseClient } from "@/utils/supabase";
import AppFlashMessage from "@/components/CustomComponents/AppFlashMessage";
import useFlashMessage from "@/hooks/useFlashMessage";
import JobEditModal from "@/components/JobComponents/JobEditModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import humanizeError from "@/utils/humanizeError";
import EntityHeroBanner from "@/components/CustomComponents/EntityHeroBanner";

export default function JobView() {
  const { t } = useTheme();
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId?: string }>();
  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [openingChat, setOpeningChat] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const inset = useSafeAreaInsets();
  const { flashMessage, showFlashMessage, hideFlashMessage } = useFlashMessage();
  const isClosed = job?.status !== "open";
  const isOwner = currentUserId === job?.employer_id;
  const budgetLabel = useMemo(() => {
    const min = Number(job?.budget_min ?? 0);
    const max = Number(job?.budget_max ?? 0);
    if (min > 0 && max > 0 && min !== max) return `₱${min.toLocaleString()} - ₱${max.toLocaleString()}`;
    if (max > 0) return `₱${max.toLocaleString()}`;
    if (min > 0) return `₱${min.toLocaleString()}`;
    return "Budget on request";
  }, [job?.budget_max, job?.budget_min]);

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      setLoading(true);
      const { data } = await supabaseClient.rpc("rpc_get_job_by_id", { p_job_id: jobId }).maybeSingle();
      if (data) setJob(data);
      setLoading(false);
    };
    fetchJob();
    supabaseClient.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, [jobId]);

  useEffect(() => {
    const fetchApplicationState = async () => {
      if (!job?.id || !currentUserId || currentUserId === job.employer_id) {
        setHasApplied(false);
        return;
      }

      const { data, error } = await supabaseClient
        .from("job_applications")
        .select("id")
        .eq("job_id", job.id)
        .eq("applicant_id", currentUserId)
        .limit(1)
        .maybeSingle();

      if (error) {
        setHasApplied(false);
        return;
      }

      setHasApplied(Boolean(data?.id));
    };

    fetchApplicationState();
  }, [currentUserId, job?.employer_id, job?.id]);

  const handleOpenConversation = async () => {
    if (!job?.id || !job?.employer_id || openingChat) return;

    if (!currentUserId) {
      showFlashMessage("Sign in required", "Please sign in before opening a conversation.", "warning");
      return;
    }

    setOpeningChat(true);
    try {
      const { data, error } = await supabaseClient.rpc("rpc_open_job_conversation_with_user", {
        p_job_id: job.id,
        p_other_user_id: job.employer_id,
      });

      if (error) throw new Error(error.message);
      if (!data) throw new Error("Unable to open conversation.");

      router.push({
        pathname: "/chatRoom/chatRoom",
        params: {
          roomId: data,
          name: "Employer",
          jobTitle: job.title,
        },
      });
    } catch (err) {
      showFlashMessage("Message failed", humanizeError(err, "Unable to open conversation."), "error");
    } finally {
      setOpeningChat(false);
    }
  };

  const handleApply = async () => {
    if (!job?.id || applying || isClosed || hasApplied) return;

    if (!currentUserId) {
      showFlashMessage("Sign in required", "Please sign in before applying to this job.", "warning");
      return;
    }

    setApplying(true);
    try {
      const { error } = await supabaseClient.rpc("rpc_apply_to_job", {
        p_job_id: job.id,
        p_cover_letter: null,
        p_expected_rate: null,
        p_resume_uri: null,
        p_answers: {},
        p_availability_note: null,
      });

      if (error) throw new Error(error.message);

      showFlashMessage("Application sent", "Your application was submitted to the employer.", "success");
      setHasApplied(true);
    } catch (err) {
      showFlashMessage("Apply failed", humanizeError(err, "Unable to submit your application."), "error");
    } finally {
      setApplying(false);
    }
  };

  const handleSetStatus = async () => {
    if (!job?.id || updatingStatus) return;

    const nextStatus = job.status === "open" ? "closed" : "open";
    setUpdatingStatus(true);
    try {
      const { data, error } = await supabaseClient
        .rpc("rpc_set_job_status", {
          p_job_id: job.id,
          p_status: nextStatus,
        })
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (!data) throw new Error("No updated job status returned.");

      setJob((prev: any) => (prev ? { ...prev, status: data.status } : prev));
      showFlashMessage(
        nextStatus === "closed" ? "Hiring stopped" : "Job reopened",
        nextStatus === "closed" ? "This job is now closed to new applicants." : "This job is open for applicants again.",
        "success"
      );
    } catch (err) {
      showFlashMessage("Update failed", humanizeError(err, "Unable to update job status."), "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return (
    <View style={[styles.centered, { backgroundColor: t.bgPage }]}>
      <ActivityIndicator color="#2563EB" size="large" />
    </View>
  );

  if (!job) return null;

  return (
    <View style={{ flex: 1, backgroundColor: t.bgPage }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <EntityHeroBanner
          title={job.title}
          subtitle={job.location_label}
          eyebrow={isClosed ? "Closed Job" : job.is_urgent ? "Urgent Hiring" : "Open Job"}
          meta={`Posted ${new Date(job.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}
          imageUri={null}
          seed={`${job.id}:${job.title}`}
          topInset={inset.top}
          onBack={() => router.back()}
        />

        <View style={[styles.contentCard, { backgroundColor: t.bgPage }]}>
          <View style={styles.headerCopy}>
            <View style={styles.topRow}>
              <View style={[styles.badge, { backgroundColor: isClosed ? "#64748B" : "#2563EB" }]}>
                <Text style={styles.badgeText}>{isClosed ? "Closed" : "Active"}</Text>
              </View>
              <Text style={[styles.dateText, { color: t.textMuted }]}>
                {isOwner ? "Your posting" : "Hiring now"}
              </Text>
            </View>

            <Text style={[styles.title, { color: t.text }]}>{job.title}</Text>

            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color="#64748B" />
              <Text style={styles.locationLabel}>{job.location_label}</Text>
            </View>

            <Text style={[styles.summaryText, { color: t.textMuted }]}>
              Shared job detail layout with a reusable color banner fallback. When job image support is added in the backend, this same screen can use it without another redesign.
            </Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: t.bgCard, borderColor: t.border }]}>
              <Text style={[styles.statHeader, { color: t.textMuted }]}>Budget</Text>
              <Text style={styles.statValue}>{budgetLabel}</Text>
            </View>

            <View style={[styles.statBox, { backgroundColor: t.bgCard, borderColor: t.border }]}>
              <Text style={[styles.statHeader, { color: t.textMuted }]}>Status</Text>
              <View style={styles.flexRowCenter}>
                <Text style={[styles.statValue, { color: t.text, fontSize: 14 }]}>{isClosed ? "Paused" : "Accepting"}</Text>
                <Feather name={isClosed ? "pause-circle" : "check-circle"} size={12} color="#2563EB" style={{ marginLeft: 6 }} />
              </View>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <TouchableOpacity 
              onPress={() => router.push({ pathname: "/map/mapView", params: { location: job.location_label } })}
              style={[styles.statBox, { backgroundColor: t.bgCard, borderColor: t.border }]}
            >
              <Text style={[styles.statHeader, { color: t.textMuted }]}>On Map</Text>
              <View style={styles.flexRowCenter}>
                <Text style={[styles.statValue, { color: t.text, fontSize: 14 }]}>View Route</Text>
                <Feather name="map-pin" size={12} color="#2563EB" style={{ marginLeft: 6 }} />
              </View>
            </TouchableOpacity>

            <View style={[styles.statBox, { backgroundColor: t.bgCard, borderColor: t.border }]}>
              <Text style={[styles.statHeader, { color: t.textMuted }]}>Chat</Text>
              <View style={styles.flexRowCenter}>
                <Text style={[styles.statValue, { color: t.text, fontSize: 14 }]}>{isOwner ? "Applicants" : "Employer"}</Text>
                <Feather name="message-circle" size={12} color="#2563EB" style={{ marginLeft: 6 }} />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>The Role</Text>
            <Text style={[styles.description, { color: t.textMuted }]}>{job.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Bar */}
      <View style={[styles.bottomBar, { 
        backgroundColor: t.bgCard, 
        paddingBottom: inset.bottom + 12,
        borderTopColor: t.border 
      }]}>
        <AppFlashMessage message={flashMessage} onClose={hideFlashMessage} />
        
        {isOwner ? (
          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              onPress={() => setEditModalVisible(true)}
              style={[styles.secondaryButton, { backgroundColor: t.bgSoft, borderColor: t.border }]}
            >
              <Text style={[styles.buttonText, { color: t.text }]}>Edit Job</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleSetStatus}
              disabled={updatingStatus}
              style={[styles.primaryButton, { backgroundColor: job.status === 'open' ? '#EF4444' : '#10B981' }]}
            >
              <Text style={styles.primaryButtonText}>
                {updatingStatus ? 'Updating...' : job.status === 'open' ? 'Stop Hiring' : 'Re-open'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              onPress={handleOpenConversation}
              disabled={openingChat}
              style={[styles.iconButton, { backgroundColor: t.bgSoft, borderColor: t.border }]}
            >
              {openingChat ? (
                <ActivityIndicator size="small" color={t.text} />
              ) : (
                <Ionicons name="chatbubbles-outline" size={24} color={t.text} />
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleApply}
              disabled={isClosed || applying || hasApplied}
              style={[styles.primaryButton, { backgroundColor: isClosed || hasApplied ? '#94A3B8' : '#2563EB' }]}
            >
              <Text style={styles.primaryButtonText}>
                {isClosed ? 'Listing Closed' : hasApplied ? 'Applied' : applying ? 'Applying...' : 'Quick Apply'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <JobEditModal
        visible={editModalVisible}
        job={job}
        onClose={() => setEditModalVisible(false)}
        onSaved={(updated) => setJob({ ...job, ...updated })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  contentCard: { 
    marginTop: -24, 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    paddingHorizontal: 24,
    paddingTop: 28 
  },
  headerCopy: {
    marginBottom: 16,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  dateText: { fontSize: 12, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', marginTop: 12, letterSpacing: -0.5 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  locationLabel: { color: '#64748B', marginLeft: 4, fontWeight: '500', fontSize: 14 },
  summaryText: { marginTop: 14, fontSize: 13, lineHeight: 20, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', gap: 12, marginTop: 24 },
  statBox: { flex: 1, padding: 16, borderRadius: 20, borderWidth: 1 },
  statHeader: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { color: '#059669', fontSize: 17, fontWeight: '800', marginTop: 4 },
  flexRowCenter: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  section: { marginTop: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  description: { lineHeight: 24, marginTop: 10, fontSize: 15 },
  bottomBar: { 
    position: 'absolute', 
    bottom: 0, 
    width: '100%', 
    paddingTop: 16, 
    paddingHorizontal: 20,
    borderTopWidth: 1,
    elevation: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  buttonGroup: { flexDirection: 'row', gap: 12 },
  iconButton: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  primaryButton: { flex: 1, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  primaryButtonText: { color: 'white', fontWeight: '800', fontSize: 16 },
  secondaryButton: { flex: 1, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  buttonText: { fontWeight: '700' }
});
