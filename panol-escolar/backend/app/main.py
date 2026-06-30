# pyrefly: ignore [missing-import]

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import admins, herramientas, prestamos, auth, turnos, informes

app = FastAPI(title="Proyecto Pañol API")

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
