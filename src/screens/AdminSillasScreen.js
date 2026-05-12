import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { supabase } from "../services/supabase";
import { theme } from "../constants/theme";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

export default function AdminSillasScreen() {
  const [nombreSilla, setNombreSilla] = useState("");
  const [sillas, setSillas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar sillas al iniciar
  useEffect(() => {
    fetchSillas();
  }, []);

  const fetchSillas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("sillas")
        .select("*")
        .order("nombre", { ascending: true });

      if (error) throw error;
      setSillas(data || []);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar las sillas");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSilla = async () => {
    if (!nombreSilla.trim()) {
      return Alert.alert("Error", "Debes ingresar un nombre para la silla");
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("sillas")
        .insert([{ nombre: nombreSilla.trim() }]);

      if (error) throw error;

      Alert.alert("Éxito", "Silla registrada correctamente");
      setNombreSilla("");
      fetchSillas();
    } catch (error) {
      Alert.alert("Error", "No se pudo registrar la silla");
    } finally {
      setLoading(false);
    }
  };

  const deleteSilla = async (id) => {
    Alert.alert(
      "Eliminar Silla",
      "¿Estás seguro? Esto podría afectar a los barberos asignados a esta silla.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              // Usamos 'identificación' que es el nombre real en tu DB
              const { error } = await supabase
                .from("sillas")
                .delete()
                .eq("identificación", id);

              if (error) throw error;
              fetchSillas();
            } catch (error) {
              Alert.alert(
                "Error",
                "No se puede eliminar una silla que está en uso.",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={styles.title}>Gestión de Sillas</Text>

      {/* Formulario de registro */}
      <View style={styles.formCard}>
        <TextInput
          style={styles.input}
          placeholder="Nombre de la silla (Ej: Silla 1)"
          placeholderTextColor="#888"
          value={nombreSilla}
          onChangeText={setNombreSilla}
        />
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleAddSilla}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.saveBtnText}>REGISTRAR SILLA</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Lista de sillas */}
      <FlatList
        data={sillas}
        keyExtractor={(item) => item.identificación}
        renderItem={({ item }) => (
          <View style={styles.sillaCard}>
            <View style={styles.sillaInfo}>
              <MaterialCommunityIcons
                name="chair-rolling"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.sillaText}>{item.nombre}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteSilla(item.identificación)}>
              <MaterialIcons name="delete-forever" size={24} color="#FF5252" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          !loading && (
            <Text style={styles.emptyText}>No hay sillas registradas</Text>
          )
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 20 },
  title: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: "#1A1A1B",
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
  },
  input: {
    backgroundColor: "#2A2A2B",
    color: "#FFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  saveBtnText: { color: "#000", fontWeight: "bold" },
  sillaCard: {
    backgroundColor: "#1A1A1B",
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sillaInfo: { flexDirection: "row", alignItems: "center" },
  sillaText: { color: "#FFF", fontSize: 16, marginLeft: 15, fontWeight: "500" },
  emptyText: { color: "#888", textAlign: "center", marginTop: 20 },
});
