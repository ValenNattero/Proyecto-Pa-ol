@echo off
echo Iniciando Proyecto Pañol...

echo Iniciando Backend...
start "Backend Panol (Puerto 8000)" /D "%~dp0backend" cmd /k ".\venv\Scripts\python.exe -m uvicorn app.main:app --port 8000 --reload"

echo Iniciando Frontend...
start "Frontend Panol (Puerto 5173)" /D "%~dp0frontend" cmd /k "npm run dev"

ping 127.0.0.1 -n 4 > nul
start http://localhost:5173

echo Aplicacion iniciada en ventanas separadas y navegador abierto.
