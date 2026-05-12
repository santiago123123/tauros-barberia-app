import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { supabase } from "../services/supabase";
import { theme } from "../constants/theme";

export default function BookingScreen({ route, navigation }) {
  const { barberId, barberName, fecha, hora } = route.params;
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState(""); 
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    if (!nombre.trim()) return Alert.alert("Error", "El nombre es obligatorio");

    setLoading(true);
    try {
      // Calculamos hora_fin (30 min después)
      const [h, m, s] = hora.split(":");
      let endM = parseInt(m) + 30;
      let endH = parseInt(h);
      if (endM >= 60) {
        endM = 0;
        endH++;
      }
      const horaFin = `${endH < 10 ? "0" + endH : endH}:${endM === 0 ? "00" : endM}:00`;

      const { error } = await supabase.from("citas").insert([
        {
          barbero_id: barberId,
          cliente_nombre: nombre,
          cliente_contacto: contacto,
          fecha: fecha,
          hora_inicio: hora,
          hora_fin: horaFin,
          estado: "confirmada",
        },
      ]);

      if (error) throw error;

      navigation.navigate("Confirmation", { barberName, fecha, hora });
    } catch (error) {
      Alert.alert("Error", "No se pudo agendar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Finalizar Reserva</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumen de Cita</Text>
        <Text style={styles.summaryText}>Barbero: {barberName}</Text>
        <Text style={styles.summaryText}>Fecha: {fecha}</Text>
        <Text style={styles.summaryText}>Hora: {hora.substring(0, 5)}</Text>
      </View>

      <Text style={styles.label}>Tu Nombre *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Juan Pérez"
        placeholderTextColor="#666"
        value={nombre}
        onChangeText={setNombre}
      />

      <Text style={styles.label}>Teléfono de Contacto</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 3001234567"
        placeholderTextColor="#666"
        value={contacto}
        onChangeText={setContacto}
        keyboardType="phone-pad"
      />



      <TouchableOpacity
        style={[styles.button, { opacity: nombre ? 1 : 0.6 }]}
        onPress={handleBooking}
        disabled={loading || !nombre}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.buttonText}>CONFIRMAR CITA</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: theme.colors.background, padding: 20 },
  title: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: theme.colors.card,
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
  },
  summaryTitle: {
    color: theme.colors.primary,
    fontWeight: "bold",
    marginBottom: 10,
  },
  summaryText: { color: "#FFF", fontSize: 16, marginBottom: 5 },
  label: { color: "#FFF", marginBottom: 8, marginTop: 15 },
  input: {
    backgroundColor: theme.colors.card,
    color: "#FFF",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  serviceBtn: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    width: "30%",
    alignItems: "center",
  },
  serviceBtnActive: { backgroundColor: theme.colors.primary },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 40,
  },
  buttonText: { color: "#000", fontWeight: "bold", fontSize: 18 },
});
