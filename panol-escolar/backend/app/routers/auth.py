from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from .. import models, schemas
from ..database import get_db
from ..security import verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.post("/login/admin")
def login_admin(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    admin = db.query(models.Admin).filter(models.Admin.username == form_data.username).first()
    if not admin or not verify_password(form_data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Payload for admin
    payload = {
        "sub": admin.username,
        "role": "admin",
        "admin_id": admin.id,
        "nombre": admin.nombre,
        "apellido": admin.apellido,
        "cargo": admin.cargo
    }
    
    access_token = create_access_token(
        data=payload, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login/panolero")
def login_panolero(panolero: schemas.PanoleroLogin):
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Payload for panolero
    payload = {
        "sub": f"{panolero.nombre} {panolero.apellido}",
        "role": "panolero",
        "nombre": panolero.nombre,
        "apellido": panolero.apellido,
        "cargo": panolero.cargo
    }
    
    access_token = create_access_token(
        data=payload, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
