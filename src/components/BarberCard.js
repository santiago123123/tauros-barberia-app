import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { theme } from "../constants/theme";

export default function BarberCard({
  name,
  specialty,
  fotoUrl,
  status,
  statusColor,
  onPress,
  disabled,
}) {
  return (
    <TouchableOpacity
      style={[styles.card, disabled && { opacity: 0.5 }]} // <-- CAMBIO: Baja opacidad si está ocupado
      onPress={onPress}
      disabled={disabled} // <-- CAMBIO: Bloquea el botón para que no puedan entrar
    >
      <Image
        source={{
          uri:
            fotoUrl && fotoUrl.trim() !== ""
              ? fotoUrl
              : "https://via.placeholder.com/150",
        }}
        style={styles.avatar}
      />

      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.specialty}>{specialty}</Text>

        {/* NUEVO: Indicador de Estado */}
        {status && (
          <View style={styles.statusContainer}>
            <View
              style={[styles.statusDot, { backgroundColor: statusColor }]}
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {status}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    padding: 15,
    borderRadius: theme.borderRadius.m,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    marginHorizontal: 20,
    elevation: 5,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: "#333",
  },
  info: {
    flex: 1,
  },
  name: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  specialty: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "bold",
  },
});
