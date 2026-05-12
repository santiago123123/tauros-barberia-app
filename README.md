# 💈 TAUROS BARBER (Booking App) - EXPO SDK 54

**Desarrolladores:**
* Santiago Stoykott Colorado Mendoza
* Lizeth Juliana Luna Ricon

---

## 📱 SISTEMA DE RESERVAS Y GESTIÓN ADMINISTRATIVA

### 📂 Estructura del Proyecto
```text
TaurosBarber/
├── .expo/               # Configuración y caché de Expo
├── assets/              # Logotipos y recursos visuales
├── src/
│   ├── components/
│   │   └── BarberCard.js       # Tarjeta con indicadores de estado
│   ├── constants/
│   │   └── theme.js            # Variables de diseño 
│   ├── navigation/
│   │   └── AppNavigator.js     # Lógica de rutas e Inactividad
│   ├── screens/
│   │   ├── HomeScreen.js           # Dashboard cliente
│   │   ├── BarberDetailScreen.js   # Selección de fecha
│   │   ├── TimeSlotScreen.js       # Selección de turnos
│   │   ├── BookingScreen.js        # Formulario de reserva
│   │   ├── ConfirmationScreen.js   # Ticket de éxito
│   │   ├── AdminBookingsScreen.js  # Panel: Gestión de citas
│   │   ├── AdminBarbersScreen.js   # Panel: CRUD de barberos
│   │   ├── AdminScheduleScreen.js  # Panel: Configuración de jornada
│   │   └── AdminSillasScreen.js    # Panel: Creación de estaciones
│   └── services/
│       └── supabase.js         # Cliente de Supabase
├── .env                 # Variables de entorno
├── App.js               # Contenedor principal
├── app.json             # Manifiesto de Expo
├── index.js             # Registro de entrada
└── package.json         # Dependencias
```
## 🚀 Pasos de Instalación (Terminal)

### 1. Base del proyecto
npx create-expo-app tauros-barberia
cd tauros-barberia

### 2. Navegación y Pantallas Seguras
npm install @react-navigation/native @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context

### 3. Base de Datos y Sesión (Incluye Polyfill)
npm install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill

### 4. Selectores, Calendarios y Relojes
npx expo install @react-native-picker/picker @react-native-community/datetimepicker

### 5. Estética e Iconos
npx expo install @expo/vector-icons expo-status-bar

## 🔑 ACCESO ADMINISTRATIVO (Credenciales)

> [!IMPORTANT]
> Estas credenciales son necesarias para acceder a los paneles de gestión de barberos, citas y horarios.

| ROL  | CONTRASEÑA |
| :--- | :--- |
| **Admin** | `1234` |
---

## 📊 Configuración de Base de Datos (4 Tablas)

### Tabla: `barberos`

| COLUMNA | TIPO | DESCRIPCIÓN |
| :--- | :--- | :--- |
| identificación | UUID | Clave Primaria (PK) |
| nombre | text | Nombre del barbero |
| activo | boolean | Si aparece en la app |

### Tabla: `horarios`

| COLUMNA | TIPO | DESCRIPCIÓN |
| :--- | :--- | :--- |
| id | int8 | PK Autoincremental |
| barbero_id | FK | Relación con barberos |
| hora_entrada | time | Inicio de jornada |
| hora_salida | time | Fin de jornada |

### Tabla: `citas`

| COLUMNA | TIPO | DESCRIPCIÓN |
| :--- | :--- | :--- |
| id | int8 | PK Autoincremental |
| barbero_id | FK | Relación con barberos |
| cliente_nombre | text | Nombre de quien reserva |
| contacto | text | Teléfono del cliente |

### Tabla: `sillas`

| COLUMNA | TIPO | DESCRIPCIÓN |
| :--- | :--- | :--- |
| identificación | int8 | PK Identificador de silla |
| nombre | text | Nombre de la estación |

## ✨ Características Implementadas

### 🕒 Sistema de Turnos Inteligente
Validación de Horarios: Bloqueo automático de horas pasadas.

Cálculo de Citas: Fin de cita automático (+30 min).

### 🛡️ Seguridad y Administración
Logout por Inactividad: Detección automática en AppNavigator.

Acceso Protegido: Separación de vistas Cliente/Admin.

### 🔄 Gestión en Tiempo Real
Status de Barbero: Indicadores de "Disponible" u "Ocupado".

Persistencia: Sesión guardada con AsyncStorage.

### 🎨 Diseño Premium (UI/UX)
Dark Mode: Fondo #1A1A1B con acentos en dorado #C5A059.

Navegación Limpia: Reseteo de rutas con CommonActions.reset.

## 🛠️ Requisitos Técnicos Finales
React Native / Expo SDK 54

React Navigation Stack

Supabase Real-time

DateTimePicker nativo




