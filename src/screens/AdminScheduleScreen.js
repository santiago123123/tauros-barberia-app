import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
} from "react-native";
import { supabase } from "../services/supabase";
import { theme } from "../constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function AdminScheduleScreen({ route, navigation }) {
  const { barbero } = route.params;

  const parseSafeDate = (timeInput) => {
    const d = new Date();
    d.setSeconds(0, 0);
    d.setMilliseconds(0);

    if (!timeInput || typeof timeInput !== "string") {
      d.setHours(8, 0);
      return d;
    }

    try {
      const timePart = timeInput.split("+")[0].split(".")[0].trim();
      const parts = timePart.split(":");
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);

      if (!isNaN(hours) && !isNaN(minutes)) {
        d.setHours(hours, minutes);
      } else {
        d.setHours(8, 0);
      }
    } catch (e) {
      d.setHours(8, 0);
    }
    return d;
  };

  const [entrada, setEntrada] = useState(() =>
    parseSafeDate(barbero?.hora_entrada),
  );
  const [salida, setSalida] = useState(() =>
    parseSafeDate(barbero?.hora_salida),
  );
  const [showEntrada, setShowEntrada] = useState(false);
  const [showSalida, setShowSalida] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (barbero) {
      setEntrada(parseSafeDate(barbero.hora_entrada));
      setSalida(parseSafeDate(barbero.hora_salida));
    }
  }, [barbero]);

  const onChangeEntrada = (event, selectedDate) => {
    setShowEntrada(false);
    if (selectedDate) setEntrada(selectedDate);
  };

  const onChangeSalida = (event, selectedDate) => {
    setShowSalida(false);
    if (selectedDate) setSalida(selectedDate);
  };

  const saveSchedule = async () => {
    setLoading(true);
    try {
      const idVal = barbero.identificación || barbero.identificacion;
      const hE = String(entrada.getHours()).padStart(2, "0");
      const mE = String(entrada.getMinutes()).padStart(2, "0");
      const hS = String(salida.getHours()).padStart(2, "0");
      const mS = String(salida.getMinutes()).padStart(2, "0");

      const { error } = await supabase
        .from("barberos")
        .update({
          hora_entrada: `${hE}:${mE}:00`,
          hora_salida: `${hS}:${mS}:00`,
        })
        .eq("identificación", idVal);

      if (error) throw error;
      Alert.alert("Éxito", "Horario actualizado correctamente", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- LA VACUNA ---
  // Forzamos a Android a olvidar los límites de la pantalla de citas
  const resetMinDate = new Date(2000, 0, 1);
  const resetMaxDate = new Date(2100, 11, 31);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="calendar-clock"
            size={60}
            color={theme.colors.primary}
          />
          <Text style={styles.title}>Gestionar Horario</Text>
          <Text style={styles.subtitle}>{barbero.nombre}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>HORA DE ENTRADA</Text>
          <TouchableOpacity
            style={styles.timeBox}
            onPress={() => setShowEntrada(true)}
          >
            <MaterialCommunityIcons
              name="clock-outline"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.timeText}>
              {entrada.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>HORA DE SALIDA</Text>
          <TouchableOpacity
            style={styles.timeBox}
            onPress={() => setShowSalida(true)}
          >
            <MaterialCommunityIcons name="history" size={24} color="#AAA" />
            <Text style={styles.timeText}>
              {salida.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.7 }]}
            onPress={saveSchedule}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.saveBtnText}>GUARDAR HORARIO</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showEntrada && (
        <DateTimePicker
          value={entrada}
          mode="time"
          display="spinner"
          minimumDate={resetMinDate} // Resetea la memoria nativa
          maximumDate={resetMaxDate} // Resetea la memoria nativa
          onChange={onChangeEntrada}
        />
      )}

      {showSalida && (
        <DateTimePicker
          value={salida}
          mode="time"
          display="spinner"
          minimumDate={resetMinDate} // Resetea la memoria nativa
          maximumDate={resetMaxDate} // Resetea la memoria nativa
          onChange={onChangeSalida}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 20 },
  header: { alignItems: "center", marginTop: 40, marginBottom: 40 },
  title: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  subtitle: { color: "#FFF", fontSize: 18, opacity: 0.8, marginTop: 5 },
  card: {
    backgroundColor: theme.colors.card,
    padding: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
    elevation: 5,
  },
  label: {
    color: "#AAA",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 10,
    letterSpacing: 1,
  },
  timeBox: {
    backgroundColor: "#111",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#444",
  },
  timeText: { color: "#FFF", fontSize: 22, fontWeight: "bold", marginLeft: 15 },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
});
