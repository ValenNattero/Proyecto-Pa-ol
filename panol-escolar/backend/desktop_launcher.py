import sys
import os
import io
import threading
import time
import traceback
import urllib.request

# 1. Protección crítica para PyInstaller --windowed: evitar crash por sys.stdout o sys.stderr en None
if sys.stdout is None:
    sys.stdout = io.StringIO()
if sys.stderr is None:
    sys.stderr = io.StringIO()

def log_error(msg, err=None):
    try:
        log_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "panol_error.log")
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}\n")
            if err:
                f.write(traceback.format_exc() + "\n")
    except Exception:
        pass

def run_server():
    """Inicia el servidor backend FastAPI en localhost:8000"""
    try:
        import uvicorn
        from app.main import app
        uvicorn.run(app, host="127.0.0.1", port=8000, log_level="error")
    except Exception as e:
        log_error("Error fatal en run_server()", e)

def wait_for_server(port=8000, timeout=15):
    """Espera activamente a que el servidor FastAPI esté respondiendo antes de abrir la interfaz"""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            req = urllib.request.Request(f"http://127.0.0.1:{port}/", method="GET")
            with urllib.request.urlopen(req, timeout=1) as res:
                if res.status in (200, 301, 302, 307, 308, 404):
                    return True
        except Exception:
            time.sleep(0.3)
    return False

def main():
    # Iniciar el servidor backend en un hilo en segundo plano (daemon)
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()

    # Esperar activamente a que el servidor responda HTTP (hasta 15 segundos)
    server_ready = wait_for_server(port=8000, timeout=15)
    if not server_ready:
        log_error("El servidor no respondió a tiempo en el puerto 8000.")

    # Abrir la interfaz en una ventana de escritorio nativa con pywebview
    try:
        import webview
        webview.create_window(
            "Sistema de Gestión - Pañol Escolar EEST N°4",
            "http://127.0.0.1:8000",
            width=1366,
            height=860,
            min_size=(1024, 700),
            resizable=True
        )
        webview.start()
    except Exception as e:
        log_error("Error al iniciar pywebview, abriendo en navegador estándar", e)
        import webbrowser
        webbrowser.open("http://127.0.0.1:8000")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass

if __name__ == "__main__":
    main()
