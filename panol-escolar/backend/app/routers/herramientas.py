from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy import or_

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/herramientas",
    tags=["herramientas"],
)

@router.get("/buscar", response_model=List[schemas.Herramienta])
def buscar_herramientas(
    q: Optional[str] = Query(None, description="Término de búsqueda para código o descripción"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Herramienta)
    if q:
        query = query.filter(
            or_(
                models.Herramienta.codigo.ilike(f"%{q}%"),
                models.Herramienta.descripcion.ilike(f"%{q}%")
            )
        )
    return query.all()

@router.post("/", response_model=schemas.Herramienta, status_code=status.HTTP_201_CREATED)
def crear_herramienta(herramienta: schemas.HerramientaCreate, db: Session = Depends(get_db)):
    # TODO: Proteger esta ruta con JWT para que solo administradores puedan acceder
    db_herramienta = models.Herramienta(**herramienta.model_dump())
    db.add(db_herramienta)
    db.commit()
    db.refresh(db_herramienta)
    return db_herramienta

@router.put("/{herramienta_id}", response_model=schemas.Herramienta)
def modificar_herramienta(herramienta_id: int, herramienta: schemas.HerramientaUpdate, db: Session = Depends(get_db)):
    # TODO: Proteger esta ruta con JWT para que solo administradores puedan acceder
    db_herramienta = db.query(models.Herramienta).filter(models.Herramienta.id == herramienta_id).first()
    if not db_herramienta:
        raise HTTPException(status_code=404, detail="Herramienta no encontrada")
    
    update_data = herramienta.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_herramienta, key, value)
        
    db.commit()
    db.refresh(db_herramienta)
    return db_herramienta
