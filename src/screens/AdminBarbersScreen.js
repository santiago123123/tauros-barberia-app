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
  Image,
  Modal,
  Switch,
} from "react-native";
import { supabase } from "../services/supabase";
import { theme } from "../constants/theme";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function AdminBarbersScreen({ navigation }) {
  const [nombre, setNombre] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [sillaId, setSillaId] = useState("");
  const [sillaNombre, setSillaNombre] = useState("Seleccionar silla...");
  const [editingId, setEditingId] = useState(null);

  const [sillas, setSillas] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchInitialData();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const { data: sData } = await supabase
        .from("sillas")
        .select("*")
        .order("nombre");
      if (sData) setSillas(sData);

      const { data: bData } = await supabase
        .from("barberos")
        .select(`*, sillas ( nombre )`)
        .order("nombre");

      if (bData) setBarberos(bData);
    } catch (e) {
      console.error("Error cargando datos:", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSilla = (silla) => {
    setSillaId(silla.identificación);
    setSillaNombre(silla.nombre);
    setModalVisible(false);
  };

  const handleSaveBarber = async () => {
    if (!nombre.trim() || !sillaId) {
      return Alert.alert("Error", "El nombre y la silla son obligatorios");
    }

    const sillaOcupada = barberos.find(
      (b) => b.silla_id === sillaId && b.identificación !== editingId,
    );

    if (sillaOcupada) {
      return Alert.alert(
        "Silla no disponible",
        `Esta silla ya está asignada a ${sillaOcupada.nombre}. Por favor, selecciona otra.`,
      );
    }

    const payload = {
      nombre,
      especialidad,
      foto_url: fotoUrl,
      silla_id: sillaId,
    };

    setLoading(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from("barberos")
          .update(payload)
          .eq("identificación", editingId);
        if (error) throw error;
        Alert.alert("Éxito", "Barbero actualizado");
      } else {
        payload.activo = true;
        const { error } = await supabase.from("barberos").insert([payload]);
        if (error) throw error;
        Alert.alert("Éxito", "Barbero creado");
      }
      resetForm();
      fetchInitialData();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (barber) => {
    try {
      setBarberos((prev) =>
        prev.map((b) =>
          b.identificación === barber.identificación
            ? { ...b, activo: !b.activo }
            : b,
        ),
      );

      const { error } = await supabase
        .from("barberos")
        .update({ activo: !barber.activo })
        .eq("identificación", barber.identificación);

      if (error) throw error;
    } catch (e) {
      Alert.alert("Error", "No se pudo cambiar el estado del barbero.");
      fetchInitialData();
    }
  };

  const deleteBarber = (id) => {
    Alert.alert(
      "Eliminar Barbero",
      "¿Estás seguro de que deseas eliminar este barbero?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const { error } = await supabase
                .from("barberos")
                .delete()
                .eq("identificación", id);
              if (error) throw error;
              fetchInitialData();
            } catch (e) {
              Alert.alert(
                "Error",
                "No se pudo eliminar. Puede que tenga citas asignadas.",
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const resetForm = () => {
    setNombre("");
    setEspecialidad("");
    setFotoUrl("");
    setSillaId("");
    setSillaNombre("Seleccionar silla...");
    setEditingId(null);
  };

  const startEdit = (item) => {
    setEditingId(item.identificación);
    setNombre(item.nombre);
    setEspecialidad(item.especialidad);
    setSillaId(item.silla_id);
    setSillaNombre(item.sillas?.nombre || "Silla seleccionada");
    setFotoUrl(item.foto_url);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* 👇 NUEVA SECCIÓN DE BOTONES DIVIDIDOS 👇 */}
      <View style={styles.headerButtonsContainer}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate("AdminBookings")}
        >
          <MaterialCommunityIcons
            name="calendar-check"
            size={20}
            color="#000"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.headerButtonText}>CITAS AGENDADAS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate("AdminSillas")}
        >
          <MaterialCommunityIcons
            name="chair-rolling"
            size={20}
            color="#000"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.headerButtonText}>GESTIÓN SILLAS</Text>
        </TouchableOpacity>
      </View>
      {/* 👆 FIN DE LA NUEVA SECCIÓN 👆 */}

      <View style={styles.formCard}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>
            {editingId ? "Editar Barbero" : "Registrar Barbero"}
          </Text>
          {editingId && (
            <TouchableOpacity onPress={resetForm}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={nombre}
          onChangeText={setNombre}
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Especialidad"
          value={especialidad}
          onChangeText={setEspecialidad}
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="URL Foto"
          value={fotoUrl}
          onChangeText={setFotoUrl}
          placeholderTextColor="#888"
        />

        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setModalVisible(true)}
        >
          <MaterialCommunityIcons
            name="chair-rolling"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.selectButtonText}>{sillaNombre}</Text>
          <MaterialIcons name="arrow-drop-down" size={24} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveBarber}>
          <Text style={styles.saveBtnText}>
            {editingId ? "ACTUALIZAR" : "GUARDAR"}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona una silla</Text>
            <FlatList
              data={sillas}
              keyExtractor={(item) => item.identificación}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectSilla(item)}
                >
                  <Text style={styles.modalItemText}>{item.nombre}</Text>
                  {sillaId === item.identificación && (
                    <MaterialIcons
                      name="check"
                      size={20}
                      color={theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <FlatList
        data={barberos}
        keyExtractor={(item) => item.identificación}
        renderItem={({ item }) => (
          <View
            style={[
              styles.barberCard,
              !item.activo && styles.barberCardInactive,
            ]}
          >
            <Image
              source={{
                uri: item.foto_url || "https://via.placeholder.com/150",
              }}
              style={[styles.avatar, !item.activo && { opacity: 0.5 }]}
            />

            <View style={styles.infoContent}>
              <View style={styles.nameRow}>
                <Text style={styles.nameText}>{item.nombre}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: item.activo ? "#2E7D32" : "#C62828" },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {item.activo ? "ACTIVO" : "INACTIVO"}
                  </Text>
                </View>
              </View>
              <Text style={styles.subText}>
                🪑 {item.sillas?.nombre || "Sin silla"} •{" "}
                {item.especialidad || "General"}
              </Text>
              {item.hora_entrada && item.hora_salida && (
                <Text
                  style={{
                    color: theme.colors.primary,
                    fontSize: 11,
                    marginTop: 2,
                  }}
                >
                  🕒 {item.hora_entrada.substring(0, 5)} -{" "}
                  {item.hora_salida.substring(0, 5)}
                </Text>
              )}
            </View>

            <View style={styles.actions}>
              <Switch
                value={item.activo}
                onValueChange={() => toggleStatus(item)}
                trackColor={{ false: "#333", true: theme.colors.primary }}
                style={styles.switchList}
              />

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("AdminSchedule", { barbero: item })
                }
                style={styles.actionBtn}
              >
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={22}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => startEdit(item)}
                style={styles.actionBtn}
              >
                <MaterialIcons name="edit" size={22} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteBarber(item.identificación)}
                style={styles.actionBtn}
              >
                <MaterialIcons name="delete" size={22} color="#FF5252" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 15 },

  // 👇 ESTILOS ACTUALIZADOS PARA LOS BOTONES DIVIDIDOS 👇
  headerButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerButton: {
    backgroundColor: theme.colors.primary,
    flex: 0.48, // Ocupa casi la mitad (48%) para dejar un pequeño espacio en medio
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  headerButtonText: {
    color: "#000",
    fontSize: 13, // Tamaño un poco más pequeño para que quepa el texto
    fontWeight: "bold",
  },
  // 👆 FIN DE ESTILOS ACTUALIZADOS 👆

  formCard: {
    backgroundColor: theme.colors.card,
    padding: 18,
    borderRadius: 15,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelText: { color: "#FF5252", fontWeight: "bold" },
  input: {
    backgroundColor: "#1A1A1B",
    color: "#FFF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1B",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 15,
  },
  selectButtonText: { color: "#FFF", flex: 1, marginLeft: 10 },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  saveBtnText: { color: "#000", fontWeight: "bold", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    width: "80%",
    maxHeight: "50%",
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  modalTitle: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalItemText: { color: "#FFF", fontSize: 16 },
  barberCard: {
    backgroundColor: theme.colors.card,
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  barberCardInactive: { opacity: 0.7, borderColor: "#C62828", borderWidth: 1 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  infoContent: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  nameText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusText: { color: "#FFF", fontSize: 10, fontWeight: "bold" },
  subText: { color: "#AAA", fontSize: 13 },
  actions: { flexDirection: "row", alignItems: "center" },
  switchList: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    marginRight: 10,
  },
  actionBtn: { marginLeft: 10 },
});
