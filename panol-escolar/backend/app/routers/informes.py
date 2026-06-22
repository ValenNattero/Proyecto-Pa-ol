from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import openpyxl
from openpyxl.styles import Font
import io

from .. import models
from ..database import get_db
from ..security import get_current_token_payload

router = APIRouter(
    prefix="/informes",
    tags=["informes"],
)

@router.get("/generar")
def generar_informe(
    db: Session = Depends(get_db),
    # token_payload: dict = Depends(get_current_token_payload) # Si se requiere auth para descargar
):
    wb = openpyxl.Workbook()
    
    # -------------------------
    # Hoja 1: Préstamos
    # -------------------------
    ws_prestamos = wb.active
    ws_prestamos.title = "Préstamos"
    
    # Encabezados
    headers_prestamos = ["Nombre y Apellido", "Herramientas Solicitadas"]
    ws_prestamos.append(headers_prestamos)
    for cell in ws_prestamos[1]:
        cell.font = Font(bold=True)
        
    # Agrupar préstamos por persona
    # Para simplificar, agruparemos por nombre+apellido
    prestamos_db = db.query(models.Prestamo).all()
    agrupados = {}
    for p in prestamos_db:
        key = f"{p.nombre_panolero} {p.apellido_panolero}"
        desc = p.herramienta.descripcion if p.herramienta else "Desconocida"
        if key not in agrupados:
            agrupados[key] = []
        agrupados[key].append(desc)
        
    for persona, herramientas in agrupados.items():
        ws_prestamos.append([persona, ", ".join(herramientas)])
        
    # -------------------------
    # Hoja 2: Inventario
    # -------------------------
    ws_inventario = wb.create_sheet(title="Inventario Completo")
    
    headers_inv = [
        "Fecha de alta", "Fecha de baja", "ID", "Herramienta/Descripción", 
        "Estado", "Categoría", "Marca", "Origen", "Código QR"
    ]
    ws_inventario.append(headers_inv)
    for cell in ws_inventario[1]:
        cell.font = Font(bold=True)
        
    herramientas_db = db.query(models.Herramienta).all()
    for h in herramientas_db:
        ws_inventario.append([
            h.fecha_alta.strftime("%Y-%m-%d %H:%M:%S") if h.fecha_alta else "",
            h.fecha_baja.strftime("%Y-%m-%d %H:%M:%S") if h.fecha_baja else "",
            h.id,
            h.descripcion,
            h.estado.value if h.estado else "",
            h.categoria.value if h.categoria else "",
            h.marca or "",
            h.origen or "",
            h.codigo_qr or ""
        ])
        
    # Guardar en memoria
    stream = io.BytesIO()
    wb.save(stream)
    stream.seek(0)
    
    # Devolver como archivo descargable
    return StreamingResponse(
        stream, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=inventario.xlsx"}
    )
