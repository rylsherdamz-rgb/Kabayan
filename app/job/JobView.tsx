import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/utils/supabase";
import AppFlashMessage from "@/components/CustomComponents/AppFlashMessage";
import useFlashMessage from "@/hooks/useFlashMessage";
import JobEditModal from "@/components/JobComponents/JobEditModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');

export default function JobView() {
  const { t } = useTheme();
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId?: string }>();
  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const inset = useSafeAreaInsets();
  const { flashMessage, showFlashMessage, hideFlashMessage } = useFlashMessage();

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

  if (loading) return (
    <View style={[styles.centered, { backgroundColor: t.bgPage }]}>
      <ActivityIndicator color="#2563EB" size="large" />
    </View>
  );

  if (!job) return null;

  const isClosed = job.status !== "open";
  const isOwner = currentUserId === job.employer_id;

  return (
    <View style={{ flex: 1, backgroundColor: t.bgPage }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        
        <View style={styles.headerImageContainer}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800" }}
            style={styles.headerImage}
          />
          {/* Scrim overlay for readability */}
          <View style={styles.headerScrim} />
          
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { top: inset.top + 10 }]}
          >
            <Feather name="arrow-left" size={22} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <View style={[styles.contentCard, { backgroundColor: t.bgPage }]}>
          <View style={styles.topRow}>
            <View style={[styles.badge, { backgroundColor: isClosed ? '#64748B' : '#2563EB' }]}>
              <Text style={styles.badgeText}>{isClosed ? 'Closed' : 'Active'}</Text>
            </View>
            <Text style={[styles.dateText, { color: t.textMuted }]}>
              {new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </Text>
          </View>

          <Text style={[styles.title, { color: t.text }]}>{job.title}</Text>
          
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color="#64748B" />
            <Text style={styles.locationLabel}>{job.location_label}</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: t.bgCard, borderColor: t.border }]}>
              <Text style={[styles.statHeader, { color: t.textMuted }]}>Monthly Budget</Text>
              <Text style={styles.statValue}>₱{job.budget_max.toLocaleString()}</Text>
            </View>
            
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
              <Text style={[styles.buttonText, { color: t.text }]}>Edit Listing</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: job.status === 'open' ? '#EF4444' : '#10B981' }]}
            >
              <Text style={styles.primaryButtonText}>
                {job.status === 'open' ? 'Stop Hiring' : 'Re-open'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: t.bgSoft, borderColor: t.border }]}
            >
              <Ionicons name="chatbubbles-outline" size={24} color={t.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => {}} 
              disabled={isClosed}
              style={[styles.primaryButton, { backgroundColor: isClosed ? '#94A3B8' : '#2563EB' }]}
            >
              <Text style={styles.primaryButtonText}>
                {isClosed ? 'Listing Closed' : 'Quick Apply'}
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
  headerImageContainer: { height: 280, width: '100%', position: 'relative' },
  headerImage: { width: '100%', height: '100%' },
  headerScrim: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.2)' 
  },
  backButton: { 
    position: 'absolute', 
    left: 16, 
    backgroundColor: 'white', 
    padding: 10, 
    borderRadius: 16, 
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  contentCard: { 
    marginTop: -30, 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    paddingHorizontal: 24,
    paddingTop: 28 
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  dateText: { fontSize: 12, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', marginTop: 12, letterSpacing: -0.5 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  locationLabel: { color: '#64748B', marginLeft: 4, fontWeight: '500', fontSize: 14 },
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