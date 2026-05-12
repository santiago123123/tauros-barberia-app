==========================================================
## PROYECTO: TAUROS BARBER (Booking App) - EXPO SDK 54
   santiago stoykott colorado mendoza
   lizeth juliana luna ricon
==========================================================
# SISTEMA DE RESERVAS Y GESTIÓN ADMINISTRATIVA

TaurosBarber/
├── .expo/ # Configuración y caché de Expo
├── assets/ # Logotipos y recursos visuales
├── src/
│   ├── components/
│   │   └── BarberCard.js # Tarjeta con indicadores de estado (Disponible/Ocupado)
│   ├── constants/
│   │   └── theme.js # Variables de diseño 
│   ├── navigation/
│   │   └── AppNavigator.js # Lógica de rutas y Sistema de Cierre por Inactividad
│   ├── screens/
│   │   ├── HomeScreen.js # Dashboard cliente: Lista de barberos activos
│   │   ├── BarberDetailScreen.js # Selección de fecha (Calendario)
│   │   ├── TimeSlotScreen.js # Selección de turnos con bloqueo de horas pasadas
│   │   ├── BookingScreen.js # Formulario de reserva y selección de servicio
│   │   ├── ConfirmationScreen.js # Ticket de éxito y reseteo de navegación
│   │   ├── AdminBookingsScreen.js # Panel: Gestión y cancelación de citas
│   │   ├── AdminBarbersScreen.js # Panel: CRUD de barberos y asignación de sillas
│   │   ├── AdminScheduleScreen.js # Panel: Configuración de jornada (Entrada/Salida)
│   │   └── AdminSillasScreen.js # Panel: Creación de estaciones físicas
│   └── services/
│       └── supabase.js # Cliente de Supabase y persistencia de sesión
├── .env # Variables de entorno (URL y Clave Privada)
├── App.js # Contenedor principal y StatusBar
├── app.json # Configuración del Manifiesto de Expo
├── index.js # Registro de entrada de la aplicación
└── package.json # Registro de dependencias instaladas

## 1. REQUISITOS PREVIOS
Node.js (Versión LTS).

Expo Go instalado en el dispositivo móvil.

Supabase Project configurado con 4 tablas (Barberos, Citas, Sillas, Servicios).

## 2. PASOS DE INSTALACIÓN (Terminal)

 1. Base del proyecto
npx create-expo-app tauros-barberia
cd tauros-barberia

 2. Navegación y Pantallas Seguras
npm install @react-navigation/native @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context

 3. Base de Datos y Sesión (Incluye el Polyfill necesario)
npm install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill

 4. Selectores, Calendarios y Relojes
npx expo install @react-native-picker/picker @react-native-community/datetimepicker

 5. Estética y Iconos
npx expo install @expo/vector-icons expo-status-bar

## 3. CONFIGURACIÓN DE BASE DE DATOS (4 Tablas)

TABLA: barberos
COLUMNA          | TIPO         | DESCRIPCION
identificación   | UUID/int8    | Clave Primaria (PK)
nombre           | text         | Nombre del barbero
especialidad     | text         | Fortalezas del barbero
foto_url         | text         | Enlace a la imagen
activo           | boolean      | Si aparece en la app
silla_id         | int8         | FK (Relacion con sillas)
TABLA: horarios
COLUMNA          | TIPO         | DESCRIPCION
id               | int8         | PK Autoincremental
barbero_id       | UUID/int8    | FK (Relacion con barberos)
hora_entrada     | time         | Inicio de jornada laboral
hora_salida      | time         | Fin de jornada laboral
TABLA: citas
COLUMNA          | TIPO         | DESCRIPCION
id               | int8         | PK Autoincremental
barbero_id       | UUID/int8    | FK (Relacion con barberos)
cliente_nombre   | text         | Nombre de quien reserva
contacto         | text         | Telefono del cliente
fecha            | date         | Dia de la reserva
hora_inicio      | time         | Slot seleccionado
hora_fin         | time         | Fin de cita (+30 min)
TABLA: sillas
COLUMNA          | TIPO         | DESCRIPCION
identificación   | int8         | PK Identificador de silla
nombre           | text         | Nombre 

## 4. CARACTERÍSTICAS IMPLEMENTADAS

🕒 SISTEMA DE TURNOS INTELIGENTE:

Validación de Horarios: Bloqueo automático de horas que ya pasaron en el día actual (no puedes reservar a las 10:00 AM si son las 11:00 AM).

Cálculo de Citas: Se calcula automáticamente el fin de la cita (30 min después de la hora de inicio).

🛡️ SEGURIDAD Y ADMINISTRACIÓN:

Logout por Inactividad: El AppNavigator detecta la falta de movimiento y cierra la sesión de Supabase para proteger el panel admin.

Acceso Protegido: Lógica de navegación que separa las vistas de cliente y administrador.

🔄 GESTIÓN DE DATOS EN TIEMPO REAL:

Status de Barbero: La app cruza la hora actual con las citas existentes para mostrar etiquetas de "Disponible" u "Ocupado" en tiempo real.

Persistencia: Uso de AsyncStorage para mantener la sesión del administrador iniciada.

🎨 DISEÑO PREMIUM (UI/UX):

Dark Mode: Fondo #1A1A1B con acentos en dorado #C5A059.

Navegación Limpia: Al terminar una cita, el sistema usa CommonActions.reset para vaciar la memoria de navegación y evitar errores de duplicado.

## 5. REQUISITOS TÉCNICOS

React Native / Expo SDK 54

React Navigation Stack para flujo lineal.

Supabase Real-time para la base de datos.

DateTimePicker para la gestión precisa de horarios.##