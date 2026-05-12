import React, { useEffect, useRef } from "react";
import { AppState, Platform, View, PanResponder } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { theme } from "../constants/theme";
import { supabase } from "../services/supabase";

// Pantallas de Cliente
import HomeScreen from "../screens/HomeScreen";
import BarberDetailScreen from "../screens/BarberDetailScreen";
import TimeSlotScreen from "../screens/TimeSlotScreen";
import BookingScreen from "../screens/BookingScreen";
import ConfirmationScreen from "../screens/ConfirmationScreen";

// Pantallas de Administración
import AdminBookingsScreen from "../screens/AdminBookingsScreen";
import AdminBarbersScreen from "../screens/AdminBarbersScreen";
import AdminScheduleScreen from "../screens/AdminScheduleScreen";
import AdminSillasScreen from "../screens/AdminSillasScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const appState = useRef(AppState.currentState);
  const timerRef = useRef(null);

  // --- LÓGICA DE CIERRE DE SESIÓN ---
  const handleLogout = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        await supabase.auth.signOut();
        console.log("Sesión cerrada por inactividad o salida.");
      }
    } catch (error) {
      console.log("Error en logout:", error.message);
    }
  };

  // --- TEMPORIZADOR DE INACTIVIDAD (10 MINUTOS) ---
  const resetInactivityTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    // 300,000 ms = 5 Minutos
    timerRef.current = setTimeout(() => {
      handleLogout();
    }, 300000);
  };

  // Detectar cualquier toque en la pantalla para reiniciar el reloj
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        resetInactivityTimer();
        return false; // Permite que el toque pase a los botones
      },
      onMoveShouldSetPanResponderCapture: () => {
        resetInactivityTimer();
        return false;
      },
    }),
  ).current;

  useEffect(() => {
    // 1. Iniciar reloj de inactividad
    resetInactivityTimer();

    // 2. Cerrar al salir de la app (Solo Móvil)
    if (Platform.OS !== "web") {
      const subscription = AppState.addEventListener(
        "change",
        (nextAppState) => {
          if (
            appState.current === "active" &&
            nextAppState.match(/inactive|background/)
          ) {
            handleLogout();
          }
          appState.current = nextAppState;
        },
      );

      return () => {
        subscription.remove();
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, []);

  return (
    // El View envuelve todo para detectar los toques en cualquier pantalla
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { fontWeight: "bold" },
          cardStyle: { backgroundColor: theme.colors.background },
        }}
      >
        {/* RUTAS DE CLIENTE */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Tauros Barber" }}
        />
        <Stack.Screen
          name="BarberDetail"
          component={BarberDetailScreen}
          options={{ title: "Seleccionar Fecha" }}
        />
        <Stack.Screen
          name="TimeSlot"
          component={TimeSlotScreen}
          options={{ title: "Horarios" }}
        />
        <Stack.Screen
          name="Booking"
          component={BookingScreen}
          options={{ title: "Mis Datos" }}
        />
        <Stack.Screen
          name="Confirmation"
          component={ConfirmationScreen}
          options={{ headerShown: false }}
        />

        {/* RUTAS DE ADMINISTRACIÓN */}
        <Stack.Screen
          name="AdminBookings"
          component={AdminBookingsScreen}
          options={{ title: "Citas Agendadas" }}
        />
        <Stack.Screen
          name="AdminBarbers"
          component={AdminBarbersScreen}
          options={{ title: "Gestionar Barberos" }}
        />
        <Stack.Screen
          name="AdminSchedule"
          component={AdminScheduleScreen}
          options={{ title: "Horarios de Trabajo" }}
        />
        <Stack.Screen
          name="AdminSillas"
          component={AdminSillasScreen}
          options={{ title: "Gestionar Sillas" }}
        />
      </Stack.Navigator>
    </View>
  );
}
