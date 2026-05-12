import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../services/supabase";
import BarberCard from "../components/BarberCard";
import { theme } from "../constants/theme";
import { MaterialIcons } from "@expo/vector-icons";

export default function HomeScreen({ navigation }) {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBarbers = async () => {
    try {
      // 1. Añadimos hora_entrada y hora_salida a la consulta original
      const { data: barbersData, error: barbersError } = await supabase
        .from("barberos")
        .select(
          "identificación, nombre, especialidad, activo, foto_url, hora_entrada, hora_salida",
        )
        .eq("activo", true);

      if (barbersError) throw barbersError;

      // 2. Lógica para el estado (Citas de hoy)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const todayStr = `${year}-${month}-${day}`;

      const { data: citasData, error: citasError } = await supabase
        .from("citas")
        .select("barbero_id, hora_inicio, hora_fin")
        .eq("fecha", todayStr);

      if (citasError) throw citasError;

      const currentMinutesTotal = now.getHours() * 60 + now.getMinutes();

      // 3. Calculamos si están disponibles, ocupados o fuera de servicio
      const barbersWithStatus = barbersData.map((barber) => {
        let status = "Fuera de servicio";
        let statusColor = "#888888";

        let workStart = 8 * 60;
        let workEnd = 19 * 60;

        if (barber.hora_entrada && barber.hora_salida) {
          const [inH, inM] = barber.hora_entrada.split(":");
          const [outH, outM] = barber.hora_salida.split(":");
          workStart = parseInt(inH) * 60 + parseInt(inM);
          workEnd = parseInt(outH) * 60 + parseInt(outM);
        }

        if (
          currentMinutesTotal >= workStart &&
          currentMinutesTotal <= workEnd
        ) {
          status = "Disponible";
          statusColor = theme.colors.available || "#4CAF50";

          const barberId = barber.identificación || barber.identificacion;
          const barberCitas = citasData.filter(
            (c) => c.barbero_id === barberId,
          );

          for (let cita of barberCitas) {
            const [startH, startM] = cita.hora_inicio.split(":");
            const [endH, endM] = cita.hora_fin.split(":");
            const startTotal = parseInt(startH) * 60 + parseInt(startM);
            const endTotal = parseInt(endH) * 60 + parseInt(endM);

            if (
              currentMinutesTotal >= startTotal &&
              currentMinutesTotal < endTotal
            ) {
              status = "Ocupado";
              statusColor = "#E53935";
              break;
            }
          }
        }

        return { ...barber, status, statusColor };
      });

      setBarbers(barbersWithStatus);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // 1. Carga los datos la primera vez que abres la app
    fetchBarbers();

    // 2. Creamos un nombre de canal ÚNICO para evitar el error de "already subscribed"
    const channelName = `cambios-en-vivo-${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "citas" },
        (payload) => {
          fetchBarbers();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "barberos" },
        (payload) => {
          fetchBarbers();
        },
      )
      .subscribe();

    // 3. Limpia la conexión al salir
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Tu acceso de admin EXACTAMENTE igual
  const handleAdminAccess = () => {
    Alert.prompt(
      "Acceso Administrativo",
      "Introduce la contraseña:",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Entrar",
          onPress: (password) => {
            if (password === "1234") {
              // Navega a la lista de barberos del admin
              navigation.navigate("AdminBarbers");
            } else {
              Alert.alert("Error", "Contraseña incorrecta");
            }
          },
        },
      ],
      "secure-text",
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Bienvenido a</Text>
          <Text style={styles.brandTitle}>Barber App</Text>
        </View>
        <TouchableOpacity
          style={styles.adminButton}
          onPress={handleAdminAccess}
        >
          <MaterialIcons
            name="admin-panel-settings"
            size={32}
            color={theme.colors.primary}
          />
          <Text
            style={{
              color: theme.colors.primary,
              fontSize: 10,
              fontWeight: "bold",
            }}
          >
            ADMIN
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={barbers}
          keyExtractor={(item, index) => {
            const id = item.identificación || item.identificacion;
            return id ? id.toString() : `home-barber-${index}`;
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchBarbers();
              }}
              tintColor={theme.colors.primary}
            />
          }
          renderItem={({ item }) => (
            <BarberCard
              name={item.nombre}
              specialty={item.especialidad}
              fotoUrl={item.foto_url}
              status={item.status} // <-- PASAMOS EL ESTADO A LA TARJETA
              statusColor={item.statusColor} // <-- PASAMOS EL COLOR A LA TARJETA
              disabled={
                item.status === "Ocupado" || item.status === "Fuera de servicio"
              }
              onPress={() => {
                const idVal = item.identificación || item.identificacion;
                navigation.navigate("BarberDetail", {
                  barberId: idVal,
                  barberName: item.nombre,
                  specialty: item.especialidad,
                  fotoUrl: item.foto_url,
                });
              }}
            />
          )}
          ListEmptyComponent={
            <Text style={{ color: "#888", textAlign: "center", marginTop: 20 }}>
              No hay barberos activos
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  welcomeText: { color: "#AAA", fontSize: 14 },
  brandTitle: { color: theme.colors.primary, fontSize: 26, fontWeight: "bold" },
  adminButton: { alignItems: "center", padding: 5 },
});
