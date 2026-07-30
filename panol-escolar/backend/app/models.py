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
    # This enum is no longer used for DB columns but kept for compatibility if needed.
    # However, it's safer to remove it completely to avoid confusion.
    pass
    
# We removed CargoPanolero enum to allow flexible strings from the frontend

class EstadoPrestamo(str, enum.Enum):
    pendiente = "pendiente"
    devuelto = "devuelto"

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    cargo = Column(String, nullable=False)

    prestamos_retiros = relationship("Prestamo", foreign_keys="[Prestamo.admin_id]", back_populates="admin")
    prestamos_devoluciones = relationship("Prestamo", foreign_keys="[Prestamo.admin_id_devolucion]", back_populates="admin_devolucion")

class Herramienta(Base):
    __tablename__ = "herramientas"

    id = Column(Integer, primary_key=True, index=True)
    descripcion = Column(String, index=True, nullable=False)
    fecha_alta = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    fecha_baja = Column(DateTime(timezone=True), nullable=True)
    estado = Column(SQLEnum(EstadoHerramienta), nullable=False, default=EstadoHerramienta.en_servicio)
    categoria = Column(SQLEnum(CategoriaHerramienta), nullable=False)
    origen = Column(String, nullable=False)
    marca = Column(String, nullable=True)
    codigo_qr = Column(String, nullable=True)
    codigo = Column(String, unique=True, index=True, nullable=True)

    prestamos = relationship("Prestamo", back_populates="herramienta")

class Prestamo(Base):
    __tablename__ = "prestamos"

    id = Column(Integer, primary_key=True, index=True)
    nombre_panolero = Column(String, nullable=False)
    apellido_panolero = Column(String, nullable=False)
    cargo_panolero = Column(String, nullable=False)
    
    nombre_solicitante = Column(String, nullable=False)
    apellido_solicitante = Column(String, nullable=False)
    cargo_solicitante = Column(String, nullable=False)
    herramienta_id = Column(Integer, ForeignKey("herramientas.id"), nullable=False)
    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=True)
    fecha_retiro = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    fecha_devolucion = Column(DateTime(timezone=True), nullable=True)
    
    nombre_devolucion = Column(String, nullable=True)
    apellido_devolucion = Column(String, nullable=True)
    cargo_devolucion = Column(String, nullable=True)
    admin_id_devolucion = Column(Integer, ForeignKey("admins.id"), nullable=True)
    
    estado = Column(SQLEnum(EstadoPrestamo), nullable=False, default=EstadoPrestamo.pendiente)
    observacion = Column(String, nullable=True)

    herramienta = relationship("Herramienta", back_populates="prestamos")
    admin = relationship("Admin", foreign_keys=[admin_id], back_populates="prestamos_retiros")
    admin_devolucion = relationship("Admin", foreign_keys=[admin_id_devolucion], back_populates="prestamos_devoluciones")
