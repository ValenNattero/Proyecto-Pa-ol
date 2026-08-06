import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

def get_database_path():
    if getattr(sys, "frozen", False):
        # Ejecutando como archivo .exe empaquetado con PyInstaller
        exe_dir = os.path.dirname(sys.executable)
        # 1. Priorizar backend/data/panol.db (cuando el .exe está en la carpeta raíz del proyecto)
        backend_db = os.path.join(exe_dir, "backend", "data", "panol.db")
        if os.path.exists(backend_db):
            return backend_db
        # 2. Si no, utilizar la carpeta data/ de forma permanente junto al .exe
        local_data_dir = os.path.join(exe_dir, "data")
        if not os.path.exists(local_data_dir):
            os.makedirs(local_data_dir, exist_ok=True)
        return os.path.join(local_data_dir, "panol.db")
    else:
        # Ejecutando desde código fuente
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        data_dir = os.path.join(base_dir, "data")
        if not os.path.exists(data_dir):
            os.makedirs(data_dir, exist_ok=True)
        return os.path.join(data_dir, "panol.db")

db_path = get_database_path()
SQLALCHEMY_DATABASE_URL = f"sqlite:///{db_path}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependencia para obtener la sesión de BD
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
