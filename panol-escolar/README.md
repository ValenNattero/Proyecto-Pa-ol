# Sistema de Gestión - Pañol Escolar

Aplicación web desarrollada para la gestión del pañol de una escuela técnica, permitiendo controlar retiros y devoluciones de herramientas por parte de estudiantes y personal.

## 🚀 Tecnologías
- **Frontend**: React.js (Vite)
- **Enrutamiento**: React Router DOM (`react-router-dom`)
- **Estilos**: CSS puro (Glassmorphism, variables CSS, UI moderna oscura)
- **Almacenamiento Temporal**: `localStorage` (simulación de base de datos)

---

## 📝 Historial de Cambios y Funcionalidades Implementadas

### 1. Estructura y Diseño Base (Glassmorphism)
- Inicialización del proyecto con Vite y React.
- Creación de un sistema de diseño basado en "efecto cristal" (fondos traslúcidos, desenfoque/blur, bordes suaves).
- Paleta de colores principal oscura para reducir la fatiga visual, con detalles vibrantes (ámbar para retiros, esmeralda para devoluciones).

### 2. Pantalla de Inicio (`Home.jsx`)
- **Buscador Rápido**: Integrado en la cabecera.
- **Formulario de Ingreso (Pañoleros)**: Solicita Nombre, Apellido y Cargo.
- **Lista de Cargos Exhaustiva**: Se configuró un menú desplegable con 32 opciones (Estudiantes de 1° a 7° año todas las divisiones, Docentes, Mantenimiento, Fuerza Aérea, Buffet).
- **Persistencia de Sesión**: Los datos del pañolero quedan guardados por 15 minutos en el `localStorage`, congelando el formulario y permitiendo entrar y salir de las pantallas rápidamente sin re-tipear.

### 3. Pantalla de Retiro (`Retiro.jsx`)
- **Carga Rápida**: Formulario en línea para escanear/tipear códigos de herramientas con foco automático.
- **Sistema de Checkboxes**: Cada herramienta cargada se lista con una casilla de verificación. Si el pañolero se equivoca, puede destildarla y el sistema la tacha visualmente, excluyéndola del registro al finalizar.
- **Menú Hamburguesa**: Integrado en la esquina superior para acceder a un buscador rápido y poder "Cerrar Sesión" manualmente.

### 4. Pantalla de Devolución (`Devolucion.jsx`)
- **Auto-Carga Inteligente**: Al entrar, el sistema lee la "base de datos" y precarga automáticamente todas las herramientas que el pañolero activo tiene pendientes de devolver.
- **Sistema de Checkboxes**: Permite devoluciones parciales (destildar lo que no se devuelve).
- **Observaciones**: Input opcional para añadir detalles sobre el estado de la herramienta devuelta.

### 5. Acceso y Panel de Administrador (`AdminDashboard.jsx`)
- **Easter Egg (Logo Oculto)**: El logo de la escuela (Ciclo Básico) actúa como botón secreto. Al hacer **doble clic** sobre él en el Home, se abre un modal de login.
- **Login**: (Actualmente seteado en `admin` / `admin`).
- **Botonera Admin**: Cuadrícula de accesos rápidos para (Retiros, Devoluciones, Carga, Modificaciones, Buscador, Inventario). Las opciones no desarrolladas muestran una alerta provisoria.
- **Lógica de Cierre de Turno**: 
  - Al presionar el botón de Cierre (ubicado estratégicamente al final), el sistema escanea todos los registros del día.
  - Si falta devolver algo, genera un reporte en pantalla indicando **Nombre del Usuario** y **Códigos Faltantes**.
  - Si todo fue devuelto, muestra un mensaje verde de éxito.

---

## ⚙️ Cómo ejecutar el proyecto localmente

1. Abrir la terminal en la carpeta `frontend`.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Levantar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
