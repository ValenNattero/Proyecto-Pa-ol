import os
import sys

# Agregar el directorio backend al path para que pueda encontrar 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import openpyxl
from app.database import SessionLocal, engine, Base
from app.models import Herramienta, CategoriaHerramienta, EstadoHerramienta

# Crear tablas si no existen
Base.metadata.create_all(bind=engine)

def seed_db():
    db = SessionLocal()
    
    excel_path = r'c:\Users\Valen\Desktop\Proyecto Pañol\BASE DE DATOS HERRAMIENTA.xlsx'
    
    print(f"Cargando datos desde {excel_path}...")
    
    try:
        # data_only=True evalúa las fórmulas y nos da el valor real (e.g. 1, 2, 3 en lugar de =SUM(...))
        wb = openpyxl.load_workbook(excel_path, data_only=True)
        sheet = wb.active
        
        agregadas = 0
        
        # Saltamos la primera fila (encabezados)
        for i, row in enumerate(sheet.iter_rows(min_row=2, values_only=True)):
            codigo = str(row[1]).strip() if row[1] is not None else None
            
            # Si el código termina en .0 (ej 1.0), lo limpiamos
            if codigo and codigo.endswith('.0'):
                codigo = codigo[:-2]
                
            descripcion = str(row[2]).strip() if row[2] else "Sin descripción"
            marca = str(row[3]).strip() if row[3] else None
            origen = str(row[6]).strip() if row[6] else "Desconocido"
            
            if not codigo or codigo == "None":
                continue # Evitar filas vacías
                
            # Verificar si ya existe en la BD para no duplicar
            existente = db.query(Herramienta).filter(Herramienta.codigo == codigo).first()
            if existente:
                continue
                
            nueva_herramienta = Herramienta(
                codigo=codigo,
                descripcion=descripcion,
                marca=marca,
                origen=origen,
                categoria=CategoriaHerramienta.herramienta,
                estado=EstadoHerramienta.en_servicio
            )
            
            db.add(nueva_herramienta)
            agregadas += 1
            
        db.commit()
        print(f"Base de datos poblada exitosamente. Se agregaron {agregadas} herramientas nuevas.")
    except Exception as e:
        print(f"Error poblando la base de datos: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
