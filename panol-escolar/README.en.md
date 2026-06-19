# 🛠️ School Tool Room Management System (Proyecto Pañol)

> 🛠️ **Project Status:** In Development (Initial Phase - Database Modeling)

This project is a **local desktop application** in development designed to manage and control a **school tool room** ("pañol escolar" - storage of tools, supplies, and safety equipment in a technical school). The final goal is to package the system as a standalone **executable file (.exe)** on Windows that runs **100% locally and offline**, without requiring internet or external servers.

---

### 🌐 Idiomas / Languages
- [Español 🇪🇸](README.md)
- **English (Current)**

---

## 🎯 What does this program plan to do?

Once the application is completed, it will allow tool room managers to:
1. **Manage Inventory:** Register additions, removals, and modifications of tools, fast-consuming supplies, and personal protective equipment.
2. **Track Resource Condition:** Know instantly whether a tool is in service, broken, or under repair.
3. **Record Loans and Returns:** Keep a clear record of who borrowed an item (students, teachers, maintenance personnel, military/air force staff, or cafeteria staff), the withdrawal date, return date, and condition remarks.
4. **Quick Identification:** Assign unique codes and QR/barcodes to tools to streamline the borrowing process.
5. **Local Authentication:** A secure login panel for authorized managers using locally hashed passwords.

---

## 🏗️ Current Phase: Database Design and Structure

Currently, the project is in its **initial stage**, with the **data modeling and validation** successfully completed on the backend. The data will be stored locally in a **SQLite** database file (`panol.db`), which is ideal for desktop applications due to its lightweight and self-contained nature.

The models defined in this phase are:

### 1. Administrators (`Admin`)
To control local access for authorized managers.
- `username` (Unique string)
- `hashed_password` (Password secured using Bcrypt encryption)

### 2. Tools (`Herramienta`)
The inventory of available items.
- `descripcion` (Name or description of the tool)
- `categoria` (Enum: `herramienta` [tool], `insumo` [supply], or `material de proteccion` [safety gear])
- `estado` (Enum: `En servicio` [In service], `Reparacion` [Under repair], or `Rota` [Broken])
- `origen` (Origin of the item, e.g., "Donation" or "Purchase")
- `codigo` / `codigo_qr` (Item identifiers)
- `fecha_alta` & `fecha_baja` (Inventory timestamps)

### 3. Loans (`Prestamo`)
The usage history of the inventory.
- Linked to a specific tool.
- Borrower information: First Name, Last Name, and Role (Enum: `Personal de mantenimiento` [Maintenance], `alumno` [Student], `docente` [Teacher], `Personal de fuerza aerea` [Air Force staff], `personal de bufete` [Cafeteria/Buffet staff], `Administrador` [Admin]).
- Timestamps and status of the loan (`fecha_retiro`, `fecha_devolucion`, and status `pendiente` [pending]/`devuelto` [returned]).
- Notes or remarks at the time of delivery or return.

---

## 🗺️ Project Roadmap

- [x] **Phase 1: Database Design & Modeling (Current Phase)**
  - Relational models with SQLAlchemy (`models.py`).
  - Data validation schemas with Pydantic (`schemas.py`).
  - Script to generate the local tables (`init_db.py`).
- [ ] **Phase 2: API Creation (Backend)**
  - Endpoint development using FastAPI for creating, reading, updating, and deleting (CRUD) tools and loans.
  - Implementation of password validation logic for administrators.
- [ ] **Phase 3: User Interface Development (Frontend)**
  - Designing views using React and Tailwind CSS tailored for intuitive desktop monitor layouts.
- [ ] **Phase 4: Integration and Packaging to `.exe`**
  - Connecting the interface to the backend.
  - Bundling the app into a single executable file using PyInstaller for direct installation at the school.

---

## 🚀 How to Test the Current Phase

In this initial phase, you can initialize and generate the local database file to verify the database table design:

### Prerequisites
- Have **Python 3.8+** installed on the computer.

### Execution Steps
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate your virtual environment:
   - **On Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the initialization script:
   ```bash
   python init_db.py
   ```
   > [!NOTE]
   > This will create a folder named `data/` inside `backend/` and inside it you will see the `panol.db` file. This is the local database file where all the tool room data will be stored.
