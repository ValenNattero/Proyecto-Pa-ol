# pyrefly: ignore [missing-import]

import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .routers import admins, herramientas, prestamos, auth, turnos, informes
from .database import SessionLocal, engine, Base
from . import models
from .security import get_password_hash

app = FastAPI(title="Proyecto Pañol API")

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        superadmin = db.query(models.Admin).filter(models.Admin.username == "SalvucciPablo").first()
        if not superadmin:
            hashed = get_password_hash("EEST4base")
            new_super = models.Admin(
                username="SalvucciPablo",
                hashed_password=hashed,
                nombre="Pablo",
                apellido="Salvucci",
                cargo="ADMINISTRADOR PRINCIPAL"
            )
            db.add(new_super)
            db.commit()
            print("Super Administrador SalvucciPablo creado exitosamente en la base de datos.")
    except Exception as e:
        print("Error al inicializar Super Administrador:", e)
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En desarrollo permitimos todo, en prod ajustar
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admins.router)
app.include_router(herramientas.router)
app.include_router(prestamos.router)
app.include_router(turnos.router)
app.include_router(informes.router)

def get_frontend_dist_path():
    if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
        # PyInstaller bundled
        return os.path.join(sys._MEIPASS, "frontend", "dist")
    else:
        # Source code run
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        return os.path.join(base_dir, "frontend", "dist")

dist_dir = get_frontend_dist_path()
assets_dir = os.path.join(dist_dir, "assets")
if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

@app.get("/{full_path:path}")
async def serve_frontend_spa(full_path: str):
    dist_path = get_frontend_dist_path()
    file_path = os.path.join(dist_path, full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    index_path = os.path.join(dist_path, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "API Backend activa. Construya el frontend para la interfaz de usuario."}

