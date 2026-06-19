# 🛠️ Sistema de Gestión de Pañol Escolar

> 🛠️ **Estado del Proyecto:** En Desarrollo (Etapa Inicial - Modelado de Base de Datos)

Este proyecto es una **aplicación de escritorio local** en desarrollo para la gestión y control de un **pañol escolar** (almacén de herramientas, insumos y equipos de seguridad de un colegio técnico). El objetivo final es empaquetar el sistema como un **archivo ejecutable (.exe)** autónomo en Windows que funcione **100% de manera local y offline**, sin requerir internet ni servidores externos.

---

### 🌐 Idiomas / Languages
- **Español (Actual)**
- [Read in English 🇬🇧](README.en.md)

---

## 🎯 ¿Qué planifica hacer este programa?

Cuando la aplicación esté terminada, permitirá a los encargados del pañol:
1. **Gestionar el Inventario:** Registrar altas, bajas y modificaciones de herramientas, insumos de consumo rápido y equipos de protección personal.
2. **Controlar el Estado de los Recursos:** Conocer al instante si una herramienta está en servicio, rota o en reparación.
3. **Registrar Préstamos y Devoluciones:** Llevar un registro claro de quién retiró una herramienta (alumnos, docentes, personal de mantenimiento, personal militar/fuerza aérea o bufete), la fecha de retiro y la fecha de devolución, junto con observaciones de su estado.
4. **Identificación Rápida:** Asignar códigos únicos y códigos QR/barras a las herramientas para agilizar el proceso de préstamo.
5. **Autenticación Local:** Un panel de administración con contraseña encriptada para asegurar que solo los encargados autorizados puedan realizar movimientos.

---

## 🏗️ Fase Actual: Diseño y Estructura de Base de Datos

Actualmente, el proyecto se encuentra en su **etapa inicial**, habiéndose completado el **diseño y modelado de datos** en el backend. Los datos se almacenarán localmente en un archivo de base de datos **SQLite** (`panol.db`), ideal para aplicaciones de escritorio por ser liviano y autogestionado.

Los modelos definidos en esta etapa son:

### 1. Administradores (`Admin`)
Para controlar el acceso local de los encargados.
- `username` (Texto único)
- `hashed_password` (Contraseña protegida mediante encriptación Bcrypt)

### 2. Herramientas (`Herramienta`)
El inventario de artículos disponibles.
- `descripcion` (Nombre o detalle de la herramienta)
- `categoria` (Enum: `herramienta`, `insumo` o `material de proteccion`)
- `estado` (Enum: `En servicio`, `Reparacion` o `Rota`)
- `origen` (De dónde proviene el artículo, p. ej. "Donación" o "Compra")
- `codigo` / `codigo_qr` (Identificadores del artículo)
- `fecha_alta` y `fecha_baja` (Registro temporal del inventario)

### 3. Préstamos (`Prestamo`)
El historial de uso de los artículos.
- Asociado a una herramienta específica.
- Datos del solicitante: Nombre, Apellido y Cargo (Enum: `Personal de mantenimiento`, `alumno`, `docente`, `Personal de fuerza aerea`, `personal de bufete`, `Administrador`).
- Temporalidad y estado del préstamo (`fecha_retiro`, `fecha_devolucion` y estado `pendiente`/`devuelto`).
- Notas u observaciones al momento de la entrega o devolución.

---

## 🗺️ Mapa de Ruta del Proyecto (Roadmap)

- [x] **Fase 1: Diseño y Modelado de Base de Datos (Etapa actual)**
  - Modelos relacionales con SQLAlchemy (`models.py`).
  - Esquemas de validación de datos con Pydantic (`schemas.py`).
  - Script para generar las tablas locales (`init_db.py`).
- [ ] **Fase 2: Creación de la API (Backend)**
  - Desarrollo de endpoints con FastAPI para crear, leer, actualizar y eliminar (CRUD) herramientas y préstamos.
  - Implementación de lógica para validación de contraseñas de administrador.
- [ ] **Fase 3: Desarrollo de la Interfaz (Frontend)**
  - Diseño de vistas en React y Tailwind CSS para un uso intuitivo en computadoras de escritorio.
- [ ] **Fase 4: Integración y Empaquetado a `.exe`**
  - Conexión entre la interfaz y el backend.
  - Compilación a ejecutable único mediante PyInstaller para su instalación directa en el colegio.

---

## 🚀 Cómo probar la Fase Actual

En esta etapa inicial, puedes inicializar y generar el archivo de base de datos local para verificar el diseño de tablas:

### Requisitos Previos
- Tener instalado **Python 3.8+** en la computadora.

### Pasos para Ejecutar
1. Abre una terminal y colócate en la carpeta del backend:
   ```bash
   cd backend
   ```
2. Crea y activa tu entorno virtual:
   - **En Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
3. Instala las dependencias necesarias:
   ```bash
   pip install -r requirements.txt
   ```
4. Ejecuta el script de inicialización:
   ```bash
   python init_db.py
   ```
   > [!NOTE]
   > Esto creará una carpeta llamada `data/` dentro de `backend/` y dentro de ella verás el archivo `panol.db`. Este es el archivo local donde se guardarán todos los datos del pañol.
