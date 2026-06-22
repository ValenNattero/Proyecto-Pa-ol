from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..security import get_current_token_payload

router = APIRouter(
    prefix="/turnos",
    tags=["turnos"],
)

@router.post("/cierre")
def cierre_de_turno(
    db: Session = Depends(get_db),
    token_payload: dict = Depends(get_current_token_payload)
):
    if token_payload.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden cerrar el turno"
        )
        
    prestamos_pendientes = db.query(models.Prestamo).filter(
        models.Prestamo.estado == models.EstadoPrestamo.pendiente
    ).all()
    
    if prestamos_pendientes:
        faltantes = []
        for p in prestamos_pendientes:
            faltantes.append({
                "prestamo_id": p.id,
                "herramienta_id": p.herramienta.id,
                "codigo": p.herramienta.codigo,
                "descripcion": p.herramienta.descripcion,
                "retirado_por": f"{p.nombre_panolero} {p.apellido_panolero}"
            })
            
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "No se puede cerrar el turno. Faltan herramientas por devolver.",
                "herramientas_pendientes": faltantes
            }
        )
        
    return {"message": "Cierre de turno exitoso. Todas las herramientas fueron devueltas."}
