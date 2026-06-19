from app.database import engine, Base
from app import models

# Crea todas las tablas en la base de datos
print("Creando la base de datos y las tablas...")
Base.metadata.create_all(bind=engine)
print("¡Base de datos generada exitosamente en backend/data/panol.db!")
