import React, { useMemo } from "react";
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";

type EntityHeroBannerProps = {
  title: string;
  subtitle?: string | null;
  eyebrow?: string | null;
  meta?: string | null;
  imageUri?: string | null;
  seed: string;
  topInset?: number;
  height?: number;
  onBack?: () => void;
  onSecondaryPress?: () => void;
  secondaryIcon?: keyof typeof Feather.glyphMap;
};

const THEMES = [
  { background: "#DBEAFE", accent: "#2563EB", shapeA: "#93C5FD", shapeB: "#BFDBFE", text: "#0F172A" },
  { background: "#DCFCE7", accent: "#059669", shapeA: "#86EFAC", shapeB: "#BBF7D0", text: "#052E16" },
  { background: "#FCE7F3", accent: "#DB2777", shapeA: "#F9A8D4", shapeB: "#FBCFE8", text: "#500724" },
  { background: "#FEF3C7", accent: "#D97706", shapeA: "#FCD34D", shapeB: "#FDE68A", text: "#451A03" },
  { background: "#E0E7FF", accent: "#4F46E5", shapeA: "#A5B4FC", shapeB: "#C7D2FE", text: "#1E1B4B" },
  { background: "#F1F5F9", accent: "#0F172A", shapeA: "#CBD5E1", shapeB: "#E2E8F0", text: "#0F172A" },
];

const getTheme = (seed: string) => {
  const hash = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return THEMES[Math.abs(hash) % THEMES.length];
};

export default function EntityHeroBanner({
  title,
  subtitle,
  eyebrow,
  meta,
  imageUri,
  seed,
  topInset = 0,
  height = 300,
  onBack,
  onSecondaryPress,
  secondaryIcon = "share-2",
}: EntityHeroBannerProps) {
  const theme = useMemo(() => getTheme(seed), [seed]);

  return (
    <View style={[styles.container, { height, backgroundColor: theme.background }]}>
      {imageUri ? (
        <ImageBackground source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover">
          <View style={styles.imageScrim} />
        </ImageBackground>
      ) : (
        <>
          <View style={[styles.shapeLarge, { backgroundColor: theme.shapeA }]} />
          <View style={[styles.shapeSmall, { backgroundColor: theme.shapeB }]} />
          <View style={[styles.shapeCorner, { borderColor: `${theme.accent}25` }]} />
        </>
      )}

      <View style={[styles.controlsRow, { top: topInset + 12 }]}>
        <TouchableOpacity onPress={onBack} style={styles.controlButton}>
          <Feather name="chevron-left" size={22} color="#0F172A" />
        </TouchableOpacity>
        {onSecondaryPress ? (
          <TouchableOpacity onPress={onSecondaryPress} style={styles.controlButton}>
            <Feather name={secondaryIcon} size={18} color="#0F172A" />
          </TouchableOpacity>
        ) : (
          <View style={styles.controlSpacer} />
        )}
      </View>

      <View style={styles.content}>
        {eyebrow ? (
          <View style={[styles.eyebrowPill, { backgroundColor: imageUri ? "rgba(255,255,255,0.18)" : `${theme.accent}18` }]}>
            <Text style={[styles.eyebrowText, { color: imageUri ? "#FFFFFF" : theme.accent }]}>{eyebrow}</Text>
          </View>
        ) : null}
        <Text style={[styles.title, { color: imageUri ? "#FFFFFF" : theme.text }]} numberOfLines={3}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: imageUri ? "rgba(255,255,255,0.92)" : `${theme.text}CC` }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        {meta ? <Text style={[styles.meta, { color: imageUri ? "rgba(255,255,255,0.88)" : `${theme.text}B3` }]}>{meta}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    position: "relative",
    justifyContent: "flex-end",
  },
  imageScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,23,42,0.34)",
  },
  shapeLarge: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    right: -48,
    top: 26,
    opacity: 0.95,
  },
  shapeSmall: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    left: -24,
    bottom: 36,
    opacity: 0.92,
  },
  shapeCorner: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 36,
    borderWidth: 20,
    right: 18,
    bottom: -110,
    transform: [{ rotate: "-14deg" }],
  },
  controlsRow: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 2,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  controlSpacer: {
    width: 44,
    height: 44,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    zIndex: 1,
  },
  eyebrowPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  eyebrowText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
    lineHeight: 36,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  meta: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "700",
  },
});
