from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from datetime import datetime
from typing import List, Optional

from .. import models, schemas
from ..database import get_db
from ..security import get_current_token_payload

router = APIRouter(
    prefix="/prestamos",
    tags=["prestamos"],
)

@router.post("/retiro/bulk", response_model=List[schemas.Prestamo], status_code=status.HTTP_201_CREATED)
def registrar_retiro_bulk(
    prestamo_data: schemas.PrestamoMultipleCreate, 
    db: Session = Depends(get_db),
    token_payload: dict = Depends(get_current_token_payload)
):
    nuevos_prestamos = []
    
    # Validar todas las herramientas antes de guardar algo
    for h_id in prestamo_data.herramientas_ids:
        herramienta = db.query(models.Herramienta).filter(models.Herramienta.id == h_id).first()
        if not herramienta:
            raise HTTPException(status_code=404, detail=f"Herramienta con ID {h_id} no encontrada")
            
        prestamo_activo = db.query(models.Prestamo).filter(
            models.Prestamo.herramienta_id == h_id,
            models.Prestamo.estado == models.EstadoPrestamo.pendiente
        ).first()
        if prestamo_activo:
            raise HTTPException(status_code=400, detail=f"La herramienta {h_id} ya se encuentra prestada")

        admin_id = token_payload.get("admin_id") if token_payload.get("role") == "admin" else None
        
        db_prestamo = models.Prestamo(
            nombre_panolero=token_payload.get("nombre"),
            apellido_panolero=token_payload.get("apellido"),
            cargo_panolero=token_payload.get("cargo"),
            nombre_solicitante=prestamo_data.nombre_solicitante,
            apellido_solicitante=prestamo_data.apellido_solicitante,
            cargo_solicitante=prestamo_data.cargo_solicitante,
            herramienta_id=h_id,
            admin_id=admin_id,
            observacion=prestamo_data.observacion,
            estado=models.EstadoPrestamo.pendiente,
        )
        db.add(db_prestamo)
        nuevos_prestamos.append(db_prestamo)
        
    db.commit()
    for p in nuevos_prestamos:
        db.refresh(p)
        
    return nuevos_prestamos

@router.put("/devolucion/bulk", response_model=List[schemas.Prestamo])
def registrar_devolucion_bulk(
    devolucion_data: schemas.PrestamoDevolucionBulk, 
    db: Session = Depends(get_db),
    token_payload: dict = Depends(get_current_token_payload)
):
    devoluciones = []
    admin_id_devolucion = token_payload.get("admin_id") if token_payload.get("role") == "admin" else None
    
    for p_id in devolucion_data.prestamos_ids:
        db_prestamo = db.query(models.Prestamo).filter(models.Prestamo.id == p_id).first()
        if not db_prestamo:
            raise HTTPException(status_code=404, detail=f"Préstamo {p_id} no encontrado")
            
        if db_prestamo.estado == models.EstadoPrestamo.devuelto:
            continue # O error, pero continuar es más robusto para bulk
            
        db_prestamo.estado = models.EstadoPrestamo.devuelto
        db_prestamo.fecha_devolucion = datetime.now()
        
        db_prestamo.nombre_devolucion = devolucion_data.nombre_solicitante
        db_prestamo.apellido_devolucion = devolucion_data.apellido_solicitante
        db_prestamo.cargo_devolucion = devolucion_data.cargo_solicitante
        db_prestamo.admin_id_devolucion = admin_id_devolucion
        
        devoluciones.append(db_prestamo)
        
    db.commit()
    for d in devoluciones:
        db.refresh(d)
        
    return devoluciones

@router.get("/pendientes", response_model=List[schemas.Prestamo])
def obtener_prestamos_pendientes(
    nombre: Optional[str] = None,
    apellido: Optional[str] = None,
    cargo: Optional[str] = None,
    db: Session = Depends(get_db),
    token_payload: dict = Depends(get_current_token_payload)
):
    query = db.query(models.Prestamo).filter(models.Prestamo.estado == models.EstadoPrestamo.pendiente)
    
    if nombre:
        query = query.filter(func.lower(models.Prestamo.nombre_solicitante).contains(func.lower(nombre)))
    if apellido:
        query = query.filter(func.lower(models.Prestamo.apellido_solicitante).contains(func.lower(apellido)))
    if cargo:
        query = query.filter(func.lower(models.Prestamo.cargo_solicitante).contains(func.lower(cargo)))
        
    return query.all()

@router.get("/", response_model=List[schemas.Prestamo])
def obtener_todos_los_prestamos(
    q: Optional[str] = Query(None, description="Término para buscar por nombre, apellido, cargo o código/descripción de herramienta"),
    estado: Optional[str] = Query(None, description="Filtrar por estado: pendiente o devuelto"),
    cargo: Optional[str] = Query(None, description="Filtrar por cargo del solicitante"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Prestamo)
    
    if estado and estado.strip():
        if estado.lower() == "pendiente":
            query = query.filter(models.Prestamo.estado == models.EstadoPrestamo.pendiente)
        elif estado.lower() == "devuelto":
            query = query.filter(models.Prestamo.estado == models.EstadoPrestamo.devuelto)
            
    if cargo and cargo.strip():
        query = query.filter(models.Prestamo.cargo_solicitante.ilike(f"%{cargo}%"))
        
    if q and q.strip():
        query = query.join(models.Herramienta).filter(
            or_(
                models.Prestamo.nombre_solicitante.ilike(f"%{q}%"),
                models.Prestamo.apellido_solicitante.ilike(f"%{q}%"),
                models.Prestamo.cargo_solicitante.ilike(f"%{q}%"),
                models.Prestamo.nombre_panolero.ilike(f"%{q}%"),
                models.Prestamo.apellido_panolero.ilike(f"%{q}%"),
                models.Herramienta.codigo.ilike(f"%{q}%"),
                models.Herramienta.descripcion.ilike(f"%{q}%")
            )
        )
        
    return query.order_by(models.Prestamo.fecha_retiro.desc()).all()
