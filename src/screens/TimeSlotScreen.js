import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../services/supabase";
import { theme } from "../constants/theme";

export default function TimeSlotScreen({ route, navigation }) {
  const { barberId, barberName, fecha } = route.params;
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      // RF-07: Validar citas existentes en la base de datos para evitar duplicados
      const { data: bookedCitas, error } = await supabase
        .from("citas")
        .select("hora_inicio")
        .eq("barbero_id", barberId) // barberId debe ser el UUID de identificación
        .eq("fecha", fecha);

      if (error) throw error;

      const bookedHours = bookedCitas.map((c) => c.hora_inicio);

      // --- INICIO LÓGICA PARA BLOQUEAR HORAS PASADAS ---
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinutes = now.getMinutes();

      // Parseamos la fecha asumiendo formato 'YYYY-MM-DD'
      // Esto previene problemas de zona horaria al crear el objeto Date
      let isPastDay = false;
      let isToday = false;

      if (fecha && fecha.includes("-")) {
        const [year, month, day] = fecha.split("-").map(Number);
        const selectedDate = new Date(year, month - 1, day);
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );

        isPastDay = selectedDate < today;
        isToday = selectedDate.getTime() === today.getTime();
      }
      // --- FIN LÓGICA FECHAS ---

      // RF-10: Generación de intervalos de tiempo (Slots) de 30 minutos
      const availableSlots = [];
      for (let h = 8; h < 19; h++) {
        // De 8 AM a 7 PM
        const hour = `${h < 10 ? "0" + h : h}:00:00`;
        const hourHalf = `${h < 10 ? "0" + h : h}:30:00`;

        [hour, hourHalf].forEach((t) => {
          // Extraemos la hora y los minutos del slot actual
          const [slotHour, slotMinute] = t.split(":").map(Number);

          // Verificamos si esta hora específica ya pasó
          let isPastTime = false;
          if (isPastDay) {
            isPastTime = true; // Todo el día ya pasó
          } else if (isToday) {
            if (
              currentHour > slotHour ||
              (currentHour === slotHour && currentMinutes >= slotMinute)
            ) {
              isPastTime = true; // La hora ya pasó hoy
            }
          }

          availableSlots.push({
            time: t,
            // RF-09: Identificar disponibilidad (Disponible vs Ocupado)
            // Se marca como ocupado si ya está en BD o si la hora ya pasó
            isBooked: bookedHours.includes(t) || isPastTime,
          });
        });
      }
      setSlots(availableSlots);
    } catch (error) {
      console.error("Error slots:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [fecha]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Horarios para el {fecha}</Text>

      {loading ? (
        <ActivityIndicator
          color={theme.colors.primary}
          size="large"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={slots}
          numColumns={3}
          keyExtractor={(item) => item.time}
          renderItem={({ item }) => (
            <TouchableOpacity
              disabled={item.isBooked}
              style={[
                styles.slot,
                {
                  backgroundColor: item.isBooked
                    ? theme.colors.card // Ocupado
                    : theme.colors.primary, // Disponible (Dorado)
                  opacity: item.isBooked ? 0.4 : 1,
                },
              ]}
              onPress={() =>
                navigation.navigate("Booking", {
                  barberId,
                  barberName,
                  fecha,
                  hora: item.time,
                })
              }
            >
              <Text
                style={[
                  styles.slotText,
                  { color: item.isBooked ? "#888" : "#000" },
                ]}
              >
                {item.time.substring(0, 5)}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 15 },
  title: {
    color: "#FFF",
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  slot: {
    flex: 1,
    margin: 5,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  slotText: { fontSize: 16, fontWeight: "bold" },
});
