from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from .models import EstadoHerramienta, CategoriaHerramienta, CargoPanolero, EstadoPrestamo

# --- Admin Schemas ---
class AdminBase(BaseModel):
    username: str

class AdminCreate(AdminBase):
    password: str

class Admin(AdminBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

# --- Herramienta Schemas ---
class HerramientaBase(BaseModel):
    descripcion: str
    estado: EstadoHerramienta = EstadoHerramienta.en_servicio
    categoria: CategoriaHerramienta
    origen: str
    codigo: Optional[str] = None
    codigo_qr: Optional[str] = None

class HerramientaCreate(HerramientaBase):
    pass

class HerramientaUpdate(BaseModel):
    descripcion: Optional[str] = None
    estado: Optional[EstadoHerramienta] = None
    categoria: Optional[CategoriaHerramienta] = None
    origen: Optional[str] = None
    codigo: Optional[str] = None
    codigo_qr: Optional[str] = None
    fecha_baja: Optional[datetime] = None

class Herramienta(HerramientaBase):
    id: int
    fecha_alta: datetime
    fecha_baja: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# --- Prestamo Schemas ---
class PrestamoBase(BaseModel):
    nombre_panolero: str
    apellido_panolero: str
    cargo_panolero: CargoPanolero
    herramienta_id: int
    observacion: Optional[str] = None

class PrestamoCreate(PrestamoBase):
    pass

class PrestamoUpdate(BaseModel):
    observacion: Optional[str] = None

class Prestamo(PrestamoBase):
    id: int
    fecha_retiro: datetime
    fecha_devolucion: Optional[datetime] = None
    estado: EstadoPrestamo

    model_config = ConfigDict(from_attributes=True)
