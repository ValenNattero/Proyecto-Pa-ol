import os
import shutil

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dist_dir = os.path.join(base_dir, "Panol_Escolar_EEST4_Portable")
    data_target_dir = os.path.join(dist_dir, "data")
    os.makedirs(data_target_dir, exist_ok=True)
    
    # 1. Copiar el ejecutable .exe
    exe_src = os.path.join(base_dir, "PanolEscolar_EEST4.exe")
    if os.path.exists(exe_src):
        shutil.copy2(exe_src, os.path.join(dist_dir, "PanolEscolar_EEST4.exe"))
        
    # 2. Copiar la base de datos oficial
    db_src = os.path.join(base_dir, "backend", "data", "panol.db")
    if os.path.exists(db_src):
        shutil.copy2(db_src, os.path.join(data_target_dir, "panol.db"))
        
    # 3. Crear archivo de instrucciones
    instrucciones_path = os.path.join(dist_dir, "INSTRUCCIONES_INSTALACION.txt")
    with open(instrucciones_path, "w", encoding="utf-8") as f:
        f.write("=========================================================\n")
        f.write("   SISTEMA DE GESTIÓN - PAÑOL ESCOLAR EEST N°4\n")
        f.write("=========================================================\n\n")
        f.write("INSTRUCCIONES PARA INSTALAR EN LA COMPU DE LA ESCUELA:\n\n")
        f.write("1. Copiar toda esta carpeta ('Panol_Escolar_EEST4_Portable') a la PC de destino\n")
        f.write("   (puedes ponerla en el Escritorio, Disco C, Documentos, etc.).\n\n")
        f.write("2. Para abrir el sistema, haz doble clic en 'PanolEscolar_EEST4.exe'.\n")
        f.write("   -> Se abrirá directamente la ventana de aplicación de escritorio.\n\n")
        f.write("3. ¿Qué contiene la carpeta 'data'?\n")
        f.write("   -> Contiene el archivo 'panol.db', que es la base de datos con todas las herramientas\n")
        f.write("      ya cargadas en el inventario y el usuario Super Administrador (SalvucciPablo / EEST4base).\n")
        f.write("   -> IMPORTANTE: No borres la carpeta 'data', ya que allí se guardarán todos los retiros y devoluciones.\n\n")
        f.write("4. REQUISITOS:\n")
        f.write("   -> El sistema es 100% independiente y autónomo.\n")
        f.write("   -> NO requiere instalar Python, ni Node.js, ni servidores adicionales.\n")
        f.write("   -> NO requiere conexión a Internet.\n")
        
    print("Carpeta portátil creada en:", dist_dir)

if __name__ == "__main__":
    main()
