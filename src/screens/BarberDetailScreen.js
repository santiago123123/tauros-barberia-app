import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { theme } from "../constants/theme";

export default function BarberDetailScreen({ route, navigation }) {
  const { barberId, barberName, specialty, fotoUrl } = route.params;
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  // --- LÍMITES DE FECHA LIMPIOS ---
  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0); // Exactamente a medianoche para evitar bloqueos de tiempo

  const maxDate = new Date(minDate);
  const daysUntilSunday = minDate.getDay() === 0 ? 0 : 7 - minDate.getDay();
  maxDate.setDate(minDate.getDate() + daysUntilSunday);
  maxDate.setHours(23, 59, 59, 999); // Hasta el final del día domingo

  const onChange = (event, selectedDate) => {
    setShow(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const continueToTimeSlot = () => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    navigation.navigate("TimeSlot", {
      barberId: barberId,
      barberName: barberName,
      fecha: formattedDate,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={{
            uri:
              fotoUrl && fotoUrl.trim() !== ""
                ? fotoUrl
                : "https://via.placeholder.com/150",
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{barberName}</Text>
        <Text style={styles.specialty}>{specialty}</Text>
      </View>

      <Text style={styles.label}>Selecciona el día para tu cita:</Text>

      <TouchableOpacity style={styles.dateButton} onPress={() => setShow(true)}>
        <Text style={styles.dateText}>
          {date.toLocaleDateString([], {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.continueBtn} onPress={continueToTimeSlot}>
        <Text style={styles.continueBtnText}>VER HORARIOS DISPONIBLES</Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display="spinner"
          minimumDate={minDate}
          maximumDate={maxDate}
          onChange={onChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 20,
    alignItems: "center",
  },
  card: {
    backgroundColor: theme.colors.card,
    width: "100%",
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#333",
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.colors.primary,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  name: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  specialty: { color: theme.colors.primary, fontSize: 16, marginTop: 5 },
  label: {
    color: "#fff",
    alignSelf: "flex-start",
    marginBottom: 10,
    marginTop: 10,
    fontWeight: "bold",
  },
  dateButton: {
    backgroundColor: "#111",
    width: "100%",
    padding: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: "center",
    marginBottom: 30,
  },
  dateText: { color: "#FFF", fontSize: 16, textTransform: "capitalize" },
  continueBtn: {
    backgroundColor: theme.colors.primary,
    width: "100%",
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
  },
  continueBtnText: { color: "#000", fontWeight: "bold", fontSize: 16 },
});
