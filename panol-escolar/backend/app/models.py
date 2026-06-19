from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base
import enum

class EstadoHerramienta(str, enum.Enum):
    en_servicio = "En servicio"
    reparacion = "Reparacion"
    rota = "Rota"

class CategoriaHerramienta(str, enum.Enum):
    herramienta = "herramienta"
    insumo = "insumo"
    material_proteccion = "material de proteccion"

class CargoPanolero(str, enum.Enum):
    mantenimiento = "Personal de mantenimiento"
    alumno = "alumno"
    docente = "docente"
    fuerza_aerea = "Personal de fuerza aerea"
    bufete = "personal de bufete"
    admin = "Administrador"

class EstadoPrestamo(str, enum.Enum):
    pendiente = "pendiente"
    devuelto = "devuelto"

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

class Herramienta(Base):
    __tablename__ = "herramientas"

    id = Column(Integer, primary_key=True, index=True)
    descripcion = Column(String, index=True, nullable=False)
    fecha_alta = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    fecha_baja = Column(DateTime(timezone=True), nullable=True)
    estado = Column(SQLEnum(EstadoHerramienta), nullable=False, default=EstadoHerramienta.en_servicio)
    categoria = Column(SQLEnum(CategoriaHerramienta), nullable=False)
    origen = Column(String, nullable=False)
    codigo_qr = Column(String, nullable=True)
    codigo = Column(String, unique=True, index=True, nullable=True)

    prestamos = relationship("Prestamo", back_populates="herramienta")

class Prestamo(Base):
    __tablename__ = "prestamos"

    id = Column(Integer, primary_key=True, index=True)
    nombre_panolero = Column(String, nullable=False)
    apellido_panolero = Column(String, nullable=False)
    cargo_panolero = Column(SQLEnum(CargoPanolero), nullable=False)
    herramienta_id = Column(Integer, ForeignKey("herramientas.id"), nullable=False)
    fecha_retiro = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    fecha_devolucion = Column(DateTime(timezone=True), nullable=True)
    estado = Column(SQLEnum(EstadoPrestamo), nullable=False, default=EstadoPrestamo.pendiente)
    observacion = Column(String, nullable=True)

    herramienta = relationship("Herramienta", back_populates="prestamos")
