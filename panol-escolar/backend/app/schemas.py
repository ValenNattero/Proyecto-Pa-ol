from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from .models import EstadoHerramienta, CategoriaHerramienta, EstadoPrestamo

# --- Admin Schemas ---
class AdminBase(BaseModel):
    username: str
    nombre: str
    apellido: str
    cargo: str

class AdminCreate(AdminBase):
    password: str
    clave_jefe: Optional[str] = None

class AdminUpdatePassword(BaseModel):
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
    marca: Optional[str] = None
    codigo: Optional[str] = None
    codigo_qr: Optional[str] = None

class HerramientaCreate(HerramientaBase):
    pass

class HerramientaUpdate(BaseModel):
    descripcion: Optional[str] = None
    estado: Optional[EstadoHerramienta] = None
    categoria: Optional[CategoriaHerramienta] = None
    origen: Optional[str] = None
    marca: Optional[str] = None
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
    cargo_panolero: str
    
    nombre_solicitante: str
    apellido_solicitante: str
    cargo_solicitante: str
    
    observacion: Optional[str] = None

class PanoleroLogin(BaseModel):
    nombre: str
    apellido: str
    cargo: str

class PrestamoCreate(PrestamoBase):
    herramienta_id: int
    admin_id: Optional[int] = None

class PrestamoMultipleCreate(BaseModel):
    herramientas_ids: list[int]
    nombre_solicitante: str
    apellido_solicitante: str
    cargo_solicitante: str
    observacion: Optional[str] = None

class PrestamoUpdate(BaseModel):
    observacion: Optional[str] = None

class PrestamoDevolucionBulk(BaseModel):
    prestamos_ids: list[int]
    nombre_solicitante: Optional[str] = None
    apellido_solicitante: Optional[str] = None
    cargo_solicitante: Optional[str] = None

class Prestamo(PrestamoBase):
    id: int
    herramienta_id: int
    admin_id: Optional[int] = None
    fecha_retiro: datetime
    fecha_devolucion: Optional[datetime] = None
    nombre_devolucion: Optional[str] = None
    apellido_devolucion: Optional[str] = None
    cargo_devolucion: Optional[str] = None
    admin_id_devolucion: Optional[int] = None
    estado: EstadoPrestamo
    herramienta: Herramienta

    model_config = ConfigDict(from_attributes=True)

class PrestamoMovimiento(PrestamoBase):
    id: int
    fecha_retiro: datetime
    fecha_devolucion: Optional[datetime] = None
    nombre_devolucion: Optional[str] = None
    apellido_devolucion: Optional[str] = None
    cargo_devolucion: Optional[str] = None
    estado: EstadoPrestamo

    model_config = ConfigDict(from_attributes=True)

class HerramientaConMovimientos(Herramienta):
    movimientos: list[PrestamoMovimiento] = []
