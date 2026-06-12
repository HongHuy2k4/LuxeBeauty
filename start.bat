@echo off
title LuxeBeauty Startup Script

echo =========================================
echo    DANG KHOI CHAY DU AN LUXE BEAUTY...
echo =========================================

echo [1/3] Dang khoi chay Backend (Laravel API)...
start "Backend (Laravel)" cmd /k "cd backend && ..\php\php.exe artisan serve"

echo [2/3] Dang khoi chay Socket Server (Realtime)...
start "Socket Server" cmd /k "cd socket && npm run dev"

echo [3/3] Dang khoi chay Frontend (React/Vite)...
start "Frontend (React)" cmd /k "cd frontend && npm run dev"

echo.
echo =========================================
echo Da mo 3 cua so Terminal de chay du an!
echo =========================================
echo - Frontend chay tai: http://localhost:3000/
echo - Backend chay tai:  http://127.0.0.1:8000
echo - Socket chay tai:   http://localhost:3001
echo.
echo Vui long giu nguyen cac cua so den (cmd) de may chu hoat dong.
echo Nhan phim bat ky de dong cua so nay...
pause >nul
