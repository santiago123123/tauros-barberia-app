import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from "react-native";
import { supabase } from "../services/supabase";
import { theme } from "../constants/theme";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";

export default function AdminBookingsScreen() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("citas")
        .select(
          `
          *,
          barberos ( nombre )
        `,
        )
        .order("fecha", { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error("Error cargando citas:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const handleDelete = async (idCita) => {
    Alert.alert(
      "Eliminar Cita",
      "¿Estás seguro de que quieres eliminar esta cita?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              // SEGÚN TU SQL: La columna se llama "identificación"
              const { error } = await supabase
                .from("citas")
                .delete()
                .eq("identificación", idCita);

              if (error) throw error;

              Alert.alert("Éxito", "Cita eliminada correctamente");
              fetchAllBookings();
            } catch (error) {
              console.error("Error al eliminar:", error);
              Alert.alert("Error", "No se pudo eliminar la cita.");
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }) => {
    const barberoNombre = item.barberos?.nombre || "No asignado";

    return (
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.clientName}>
            {item.cliente_nombre || "Sin Nombre"}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{item.fecha}</Text>
            </View>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.identificación)}
            >
              <Feather name="trash-2" size={18} color="#E53935" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.rowStart}>
          <Feather
            name="phone-call"
            size={12}
            color="#888"
            style={{ marginRight: 5 }}
          />
          <Text style={styles.phoneText}>{item.cliente_contacto}</Text>
        </View>

        <View style={styles.rowStart}>
          <MaterialCommunityIcons
            name="content-cut"
            size={14}
            color={theme.colors.primary}
            style={{ marginRight: 5 }}
          />
          <Text style={styles.barberText}>Barbero: {barberoNombre}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.labelSmall}>Inicio / Fin</Text>
            <Text style={styles.timeText}>
              {item.hora_inicio?.substring(0, 5)} -{" "}
              {item.hora_fin?.substring(0, 5)}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.labelSmall}>Duración</Text>
            <Text style={styles.durationText}>
              {item.duracion_estimada || "30 min"}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Citas Agendadas</Text>

      {loading && !refreshing ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={appointments}
          // USA EL CAMPO CORRECTO PARA LAS LLAVES: identificación
          keyExtractor={(item) => String(item.identificación)}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchAllBookings();
              }}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 20 },
  title: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#1A1A1B",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  rowStart: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  clientName: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  dateBadge: {
    backgroundColor: "#2A2A2B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dateText: { color: "#CCC", fontSize: 12 },
  deleteButton: {
    marginLeft: 10,
    padding: 6,
    backgroundColor: "rgba(229, 57, 53, 0.15)",
    borderRadius: 6,
  },
  phoneText: { color: "#888", fontSize: 13 },
  barberText: { color: theme.colors.primary, fontSize: 14, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#2A2A2B", marginVertical: 10 },
  labelSmall: { color: "#888", fontSize: 11, marginBottom: 2 },
  timeText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  durationText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "bold",
  },
});
