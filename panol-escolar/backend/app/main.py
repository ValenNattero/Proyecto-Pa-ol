# pyrefly: ignore [missing-import]

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
