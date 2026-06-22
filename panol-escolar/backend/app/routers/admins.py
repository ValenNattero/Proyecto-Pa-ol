from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import os

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/admins",
    tags=["admins"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Para este ejemplo, configuraremos la clave de jefe aquí, pero idealmente vendría de variables de entorno (.env)
CLAVE_JEFE = os.getenv("CLAVE_JEFE", "admin1234")

def get_password_hash(password):
    return pwd_context.hash(password)

@router.post("/", response_model=schemas.Admin, status_code=status.HTTP_201_CREATED)
def create_admin(admin: schemas.AdminCreate, db: Session = Depends(get_db)):
    if admin.clave_jefe != CLAVE_JEFE:
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
