import os
import sys
import shutil
import subprocess

def main():
    print("=====================================================================")
    print("   GENERADOR DE PROGRAMA DE ESCRITORIO (.EXE) - PAÑOL ESCOLAR EEST 4")
    print("=====================================================================")
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(base_dir)
    frontend_dir = os.path.join(project_root, "frontend")
    frontend_dist = os.path.join(frontend_dir, "dist")

    print("\n[1/3] Compilando el bundle de producción del Frontend (npm run build)...")
    subprocess.run(["npm", "run", "build"], cwd=frontend_dir, shell=True, check=True)
    print(" -> Frontend compilado exitosamente en frontend/dist.")

    print("\n[2/3] Generando archivo ejecutable .EXE con PyInstaller...")
    pyinstaller_cmd = [
        sys.executable, "-m", "PyInstaller",
        "--name", "PanolEscolar_EEST4",
        "--onefile",
        "--windowed",
        "--add-data", f"{frontend_dist};frontend/dist",
        "--collect-all", "uvicorn",
        "--collect-all", "fastapi",
        "--collect-all", "pydantic",
        "--collect-all", "starlette",
        "--collect-all", "sqlalchemy",
        "--collect-all", "bcrypt",
        "--collect-all", "webview",
        "desktop_launcher.py"
    ]

    res = subprocess.run(pyinstaller_cmd, cwd=base_dir)
    if res.returncode != 0:
        print("\n[ERROR] Falló la generación con PyInstaller.")
        sys.exit(1)

    print("\n[3/3] Copiando el archivo .EXE generado a la carpeta principal del proyecto...")
    exe_source = os.path.join(base_dir, "dist", "PanolEscolar_EEST4.exe")
    exe_target = os.path.join(project_root, "PanolEscolar_EEST4.exe")
    
    if os.path.exists(exe_source):
        shutil.copy2(exe_source, exe_target)
        print(f"\n[EXITO] Programa de escritorio generado y copiado en:")
        print(f" -> {exe_target}")
        print("\nYa podés hacer doble clic en 'PanolEscolar_EEST4.exe' para ejecutar el sistema como aplicación de escritorio Windows.")
    else:
        print("\n[ERROR] No se encontró el archivo .exe en dist/")

if __name__ == "__main__":
    main()
