# Sistema de Gestión - Pañol Escolar EEST N°4

Aplicación web Full Stack para la gestión integral del pañol de una escuela técnica, permitiendo controlar el inventario de herramientas, retiros, devoluciones, usuarios administradores y seguridad de forma ágil, moderna y automatizada.

---

## 🚀 Tecnologías del Stack

### **Frontend**
- **Framework**: React.js 18 con Vite
- **Enrutamiento**: React Router DOM (`react-router-dom`)
- **Diseño & UI**: CSS Puro con diseño **Glassmorphism** (efecto cristal traslúcido, bordes luminosos y modo oscuro premium)
- **Íconos & Accesibilidad**: Lucide React / Emojis intuitivos para una experiencia ágil de taller
- **Almacenamiento Temporal**: Sesiones temporales controladas con renovación automática en el cliente

### **Backend & Base de Datos**
- **API Server**: Python 3.12 + **FastAPI** (servidor web asincrónico y tipado seguro con Pydantic V2)
- **Base de Datos**: Relacional con **SQLAlchemy** y **SQLite** (`pañol.db`), con generación automática de esquemas
- **Seguridad & Autenticación**: 
  - Encriptación de contraseñas de alta seguridad con **`bcrypt`** nativo (libre de dependencias obsoletas)
  - Autenticación mediante **JSON Web Tokens (JWT)** (`Bearer Access Tokens`)

---

## 📝 Historial Completo de Funcionalidades y Mejoras Implementadas

### 1. Estructura y Diseño Base (Glassmorphism Premium)
- Inicialización del proyecto web con Vite, React y FastAPI.
- Sistema de diseño de "efecto cristal" con fondos de gradientes oscuros para evitar fatiga visual en el taller, acentos en ámbar vibrante para administración/retiros y esmeralda para devoluciones.
- Animaciones suaves de transición, modales flotantes y notificaciones visuales (Toasts).

### 2. Pantalla de Inicio y Privacidad en Terminal (`Home.jsx`)
- **Buscador Rápido de Herramientas**: Barra superior autocompletada por código o descripción en tiempo real.
- **Formulario de Ingreso de Pañoleros**: Solicita Nombre, Apellido y Cargo (más de 32 opciones organizadas para estudiantes de 1° a 7° año, docentes y personal).
- **Protección de Privacidad de Terminal**: Cada vez que se regresa al Inicio (`/` o "Bienvenidos"), el sistema **limpia automáticamente cualquier sesión de ingresos anteriores** (`clearSession()`). Los campos inician siempre vacíos, garantizando que un nuevo pañolero o estudiante no vea datos de la persona anterior.

### 3. Pantalla de Retiro (`Retiro.jsx`)
- **Carga Ágil por Escáner/Teclado**: Formulario con foco automático para ingresar códigos de herramientas de forma consecutiva.
- **Sistema de Checkboxes**: Permite destildar y tachar visualmente herramientas cargadas por error antes de confirmar el préstamo en bloque.
- **Sincronización Inmediata**: Al confirmar, la base de datos actualiza el estado de la herramienta a `PRESTADA` y registra al solicitante.

### 4. Pantalla de Devolución e Inventario Faltante (`Devolucion.jsx`)
- **Devolución Ágil**: Operación optimizada donde **no es obligatorio** ingresar los datos de la persona que devuelve; alcanza con la sesión activa del terminal.
- **Lista Global de Herramientas Prestadas (Faltantes del Pañol)**: 
  - Muestra un listado en vivo de **todas las herramientas que están actualmente prestadas** y pendientes de devolver en el pañol.
  - Ordenado numéricamente de forma incremental para una localización visual instantánea.
  - Indica el código, la descripción y el nombre completo de la persona que la retiró.
- **Devoluciones Parciales y Estado Técnico**: Soporte para seleccionar sólo las herramientas entregadas y registrar observaciones de daño o reparación en la base de datos.

### 5. Panel de Control de Administración (`AdminDashboard.jsx`)
- **Easter Egg de Acceso (Logo Oculto)**: Doble clic en el escudo del Ciclo Básico desde la página de inicio para abrir el modal de acceso administrativo.
- **Menú Centralizado de Administración**: Acceso a Retiros, Devoluciones, Buscador / Inventario, Carga de Herramientas, Modificaciones y Administración de Usuarios.
- **Lógica de Cierre de Turno**: Escaneo completo de los préstamos activos con reporte de faltantes por alumno/docente o confirmación de pañol sin deudas.

### 6. Buscador e Inventario Completo (`/admin/inventario`)
- **Tabla Global y Buscador en Vivo**: Visualización del inventario con filtros por código o descripción.
- **Ordenamiento Dinámico Ascendente/Descendente**: 
  - Botones de orden con indicador visual de flechas: **`Por código ▲ / ▼`** y **`Por descripción ▲ / ▼`**.
  - Permite al pañolero ordenar el inventario incrementalmente (`1, 2, 3...`) o alfabéticamente por descripción con un solo clic.
- **Historial de Préstamos**: Consulta del registro histórico completo de cada herramienta.

### 7. Carga y Modificación de Herramientas (`/admin/carga` y `/admin/modificaciones`)
- **Autocompletado e Incremental de Códigos**: Al seleccionar una categoría, el backend calcula automáticamente el próximo número de inventario disponible para acelerar la carga.
- **Carga Masiva vía Excel / CSV**: Importación directa de archivos `.xlsx`, `.xls` y `.csv` con validación de códigos duplicados y descarga de plantilla de ejemplo.
- **Modificaciones de Estado en Caliente**: Edición rápida de descripciones, categorías y estados de conservación (`DISPONIBLE`, `PRESTADA`, `EN REPARACION`, `ROTO`, `EXTRAVIADA`).

### 8. Super Administrador Principal y Gestión de Usuarios (`/admin/usuarios`)
- **Super Administrador Blindado (`SalvucciPablo`)**:
  - Cuenta maestra creada automáticamente al iniciar el servidor (`SalvucciPablo` / `EEST4base`).
  - Único usuario autorizado para visualizar y acceder al botón dorado **`👥 Administrar Usuarios Admin`** en el panel de control.
- **Gestión Completa de Cuentas Admin**:
  - Creación de nuevos usuarios administradores autorizados para usar el sistema.
  - Cambio y blanqueo de contraseñas de cualquier administrador en segundos.
  - Eliminación de administradores con **protección de seguridad en la API** que impide eliminar la cuenta principal de `SalvucciPablo` (`HTTP 400`).

---

### 9. Suite de Pruebas Automatizadas de Calidad (QA Automated Test Suite - `qa_test_suite.py`)
Para certificar la fiabilidad y seguridad del sistema sin errores ni bugs, se desarrolló un módulo completo de pruebas QA en Python nativo (`unittest` + `urllib`), ejecutándose en milisegundos sin requerir dependencias externas:

| ID | Prueba QA | Objetivo Verificado | Estado |
| :---: | :--- | :--- | :---: |
| **QA-01** | `test_01_verify_superadmin_exists` | Verifica que `SalvucciPablo` exista en la tabla `admins` de la base de datos. | **`PASSED`** ✅ |
| **QA-02** | `test_02_superadmin_login_success` | Valida login exitoso con credenciales oficiales y emisión de Token Bearer JWT. | **`PASSED`** ✅ |
| **QA-03** | `test_03_superadmin_login_invalid_password` | Comprueba que contraseñas inválidas sean rechazadas con `401 Unauthorized`. | **`PASSED`** ✅ |
| **QA-04** | `test_04_create_qa_test_admin` | Valida creación de nuevos usuarios admin mediante `POST /admins/` (cifrado `bcrypt`). | **`PASSED`** ✅ |
| **QA-05** | `test_05_update_qa_test_admin_password` | Verifica modificación segura de clave del usuario en la API (`PUT /admins/{id}/password`). | **`PASSED`** ✅ |
| **QA-06** | `test_06_delete_qa_test_admin` | Confirma la eliminación correcta del usuario temporal (`DELETE /admins/{id}`). | **`PASSED`** ✅ |
| **QA-07** | `test_07_protect_superadmin_deletion` | Certifica que la API impida eliminar la cuenta del Super Admin `SalvucciPablo` (`HTTP 400`). | **`PASSED`** ✅ |
| **QA-08** | `test_08_herramientas_list_and_search_endpoint` | Comprueba la respuesta y estructura de `/herramientas/inventario` y `/herramientas/buscar`. | **`PASSED`** ✅ |
| **QA-09** | `test_09_prestamos_pendientes_endpoint` | Verifica la consulta de préstamos activos protegida con autenticación Bearer Token. | **`PASSED`** ✅ |

---

## 🛠️ Instrucciones de Instalación y Ejecución Local

### 1. Servidor Backend (FastAPI + Base de Datos)
1. Abrir una terminal en la carpeta `backend`:
   ```bash
   cd backend
   ```
2. Activar el entorno virtual (si se utiliza):
   ```bash
   .\venv\Scripts\activate
   ```
3. Instalar las librerías necesarias:
   ```bash
   pip install -r requirements.txt
   ```
4. Levantar el servidor backend en el puerto `8000`:
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   > El Super Administrador **`SalvucciPablo`** se verificará y creará automáticamente al iniciar.

### 2. Cliente Frontend (React + Vite)
1. Abrir otra terminal en la carpeta `frontend`:
   ```bash
   cd frontend
   ```
2. Instalar las dependencias de Node:
   ```bash
   npm install
   ```
3. Levantar el servidor web de desarrollo:
   ```bash
   npm run dev
   ```
4. Acceder al sistema en **`http://localhost:5173`**.

---

## 🧪 Cómo Ejecutar las Pruebas de Calidad (QA Suite)
Con el backend en ejecución, abrir una terminal en la carpeta `backend` y correr:
```bash
python qa_test_suite.py
```
*Se ejecutarán automáticamente las 9 pruebas de integración certificando que el sistema funciona sin errores, bugs ni problemas de seguridad.*

---

## 🖥️ Ejecución como Programa de Escritorio Windows (`.EXE`)

Para utilizar el sistema sin necesidad de comandos de terminal ni navegadores separados, se generó el programa independiente de escritorio:
- **Archivo:** `PanolEscolar_EEST4.exe` (ubicado en la carpeta raíz del proyecto).
- **Tecnología:** Empaqueta en un solo ejecutable el servidor backend **FastAPI**, la base de datos **SQLite**, el bundle de producción de **React** y un contenedor de ventana nativa con **PyWebview**.

### ¿Cómo ejecutarlo?
1. Hacé doble clic sobre el archivo **`PanolEscolar_EEST4.exe`** en tu carpeta de proyecto.
2. Se iniciará una ventana de aplicación de escritorio nativa de Windows con el sistema Pañol Escolar listo para utilizar.
3. Al cerrar la ventana, el servidor en segundo plano se detiene automáticamente.

### ¿Cómo regenerar el archivo `.exe` en caso de realizar cambios?
Si en el futuro modificás el código (frontend o backend) y querés crear un nuevo ejecutable actualizado:
1. Abrí la terminal en la carpeta `backend`:
   ```bash
   cd backend
   ```
2. Ejecutá el script automatizado de construcción:
   ```bash
   .\venv\Scripts\python.exe build_exe.py
   ```
   *Este script compilará automáticamente el frontend (`npm run build`), empaquetará la aplicación con PyInstaller y dejará el archivo `PanolEscolar_EEST4.exe` actualizado en la carpeta raíz del proyecto.*

