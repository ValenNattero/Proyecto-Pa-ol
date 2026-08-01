from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import os

from .. import models, schemas
from ..database import get_db
from ..security import get_password_hash

router = APIRouter(
    prefix="/admins",
    tags=["admins"],
)

CLAVE_JEFE = os.getenv("CLAVE_JEFE", "admin1234")

@router.get("/", response_model=List[schemas.Admin])
def get_admins(db: Session = Depends(get_db)):
    return db.query(models.Admin).all()

@router.post("/", response_model=schemas.Admin, status_code=status.HTTP_201_CREATED)
def create_admin(admin: schemas.AdminCreate, db: Session = Depends(get_db)):
    if admin.clave_jefe and admin.clave_jefe != CLAVE_JEFE:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Clave de jefe incorrecta",
        )
    
    db_admin = db.query(models.Admin).filter(models.Admin.username == admin.username).first()
    if db_admin:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya está registrado")
    
    hashed_password = get_password_hash(admin.password)
    
    new_admin = models.Admin(
        username=admin.username,
        hashed_password=hashed_password,
        nombre=admin.nombre,
        apellido=admin.apellido,
        cargo=admin.cargo
    )
    
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    
    return new_admin

@router.put("/{admin_id}/password", response_model=schemas.Admin)
def update_admin_password(admin_id: int, data: schemas.AdminUpdatePassword, db: Session = Depends(get_db)):
    db_admin = db.query(models.Admin).filter(models.Admin.id == admin_id).first()
    if not db_admin:
        raise HTTPException(status_code=404, detail="Usuario admin no encontrado")
    
    db_admin.hashed_password = get_password_hash(data.password)
    db.commit()
    db.refresh(db_admin)
    return db_admin

@router.delete("/{admin_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin(admin_id: int, db: Session = Depends(get_db)):
    db_admin = db.query(models.Admin).filter(models.Admin.id == admin_id).first()
    if not db_admin:
        raise HTTPException(status_code=404, detail="Usuario admin no encontrado")
    
    if db_admin.username == "SalvucciPablo":
        raise HTTPException(status_code=400, detail="No se puede eliminar al Super Administrador principal")
    
    db.delete(db_admin)
    db.commit()
    return None
