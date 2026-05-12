import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../constants/theme";
// 1. IMPORTAMOS COMMONACTIONS PARA REINICIAR LA MEMORIA
import { CommonActions } from "@react-navigation/native";

export default function ConfirmationScreen({ route, navigation }) {
  const { barberName, fecha, hora } = route.params;

  // 2. NUEVA FUNCIÓN PARA VOLVER AL INICIO Y LIMPIAR MEMORIA
  const goHomeAndCleanMemory = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }], // Destruye todo y deja solo el Home
      }),
    );
  };

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="check-circle"
        size={120}
        color={theme.colors.available}
      />
      <Text style={styles.title}>¡Todo Listo!</Text>
      <Text style={styles.subtitle}>Tu cita ha sido agendada con éxito.</Text>

      <View style={styles.receipt}>
        <Text style={styles.receiptLabel}>Resumen:</Text>
        <View style={styles.divider} />
        <Text style={styles.val}>Barbero: {barberName}</Text>
        <Text style={styles.val}>Fecha: {fecha}</Text>
        <Text style={styles.val}>Hora: {hora.substring(0, 5)}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={goHomeAndCleanMemory} // <-- USAMOS LA NUEVA FUNCIÓN
      >
        <Text style={styles.buttonText}>VOLVER AL INICIO</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  title: { color: "#FFF", fontSize: 28, fontWeight: "bold", marginTop: 20 },
  subtitle: {
    color: "#AAA",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  receipt: {
    backgroundColor: theme.colors.card,
    width: "100%",
    padding: 25,
    borderRadius: 20,
  },
  receiptLabel: {
    color: theme.colors.primary,
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 18,
  },
  divider: {
    height: 1,
    backgroundColor: "#444",
    marginVertical: 10,
  },
  val: {
    color: "#FFF",
    fontSize: 16,
    marginBottom: 8,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 40,
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
});
