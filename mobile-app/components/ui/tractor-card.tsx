import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Strings } from "@/constants/Strings";
import { Tractor } from "@/services/api";

interface Props {
  tractor: Tractor;
  onPress: () => void;
  onEdit: (tractor: Tractor) => void; // ✅ Added Edit handler
  onDelete: (id: number) => void; // ✅ Added Delete handler
}

const ACTIVE_COLOR = "#2E7D32";
const ACTIVE_COLOR_TRANSPARENT = ACTIVE_COLOR + "15";
const DELETE_COLOR = "#C62828";

export function TractorCard({ tractor, onPress, onEdit, onDelete }: Props) {
  const plateRegion = tractor.plateNumber.split("-").slice(0, 2).join("-");
  const modelToDisplay = tractor.modelName || `${plateRegion} Region`;

  // Function to handle delete confirmation
  const handleDeletePress = () => {
    Alert.alert(
      "ट्रॅक्टर हटवा", // Delete Tractor
      `${tractor.plateNumber} हटवायचा आहे का? सर्व डेटा कायमचा निघून जाईल.`,
      [
        { text: "रद्द करा", style: "cancel" },
        {
          text: "हटवा",
          style: "destructive",
          onPress: () => onDelete(tractor.id),
        },
      ]
    );
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.row}>
          <View style={styles.leftSection}>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: ACTIVE_COLOR_TRANSPARENT },
              ]}
            >
              <MaterialCommunityIcons
                name="tractor"
                size={24}
                color={ACTIVE_COLOR}
              />
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.plate}>{tractor.plateNumber}</Text>
              <Text style={styles.model}>{modelToDisplay}</Text>
            </View>
          </View>

          <View style={styles.rightSection}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: ACTIVE_COLOR_TRANSPARENT },
              ]}
            >
              <Text style={[styles.statusText, { color: ACTIVE_COLOR }]}>
                {Strings.status.RUNNING}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>{Strings.driver}:</Text>
            <Text style={styles.statValue}>{tractor.driverName || "—"}</Text>
          </View>
          <View style={styles.stat}>
     <Text style={styles.statLabel}>{Strings.mukadamName}:</Text> 
     <Text style={styles.statValue}>
        {tractor.mukadamName || 'No Mukadam'}
     </Text>
  </View>
        </View>
      </TouchableOpacity>

      {/* ✅ NEW: Management Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onEdit(tractor)}
        >
          <MaterialCommunityIcons
            name="pencil-outline"
            size={18}
            color="#555"
          />
          <Text style={styles.actionText}>{Strings.edit || "Edit"}</Text>
        </TouchableOpacity>

        <View style={styles.verticalDivider} />

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDeletePress}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={18}
            color={DELETE_COLOR}
          />
          <Text style={[styles.actionText, { color: DELETE_COLOR }]}>हटवा</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ccd0d4ff",
    overflow: "hidden",
    elevation: 2,
  },
  cardContent: {
    padding: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftSection: { flexDirection: "row", alignItems: "center", flex: 1.5 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoBox: { flex: 1 },
  plate: { fontSize: 16, fontWeight: "bold", color: "#333" },
  model: { fontSize: 12, color: "#888" },
  rightSection: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: "bold" },
  divider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 10 },
  footer: { flexDirection: "row", justifyContent: "space-between" },
  stat: { flexDirection: "row", alignItems: "center" },
  statLabel: { fontSize: 12, color: "#888", marginRight: 6 },
  statValue: { fontSize: 12, fontWeight: "600", color: "#333" },

  // ✅ NEW Styles for Action Bar
  actionBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#FAFAFA",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginLeft: 6,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: "#f0f0f0",
    height: "100%",
  },
});
