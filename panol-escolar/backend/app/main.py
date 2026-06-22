# pyrefly: ignore [missing-import]

from fastapi import FastAPI
from .routers import admins, herramientas, prestamos, auth, turnos, informes

app = FastAPI(title="Proyecto Pañol API")

app.include_router(auth.router)
app.include_router(admins.router)
app.include_router(herramientas.router)
app.include_router(prestamos.router)
app.include_router(turnos.router)
app.include_router(informes.router)
