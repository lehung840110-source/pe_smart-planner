@echo off
chcp 65001 >nul
title PE SmartPlan 2.0 - Khoi dong che do Offline
cd /d "%~dp0\.."

echo ========================================================
echo   PE SMARTPLAN 2.0 - CHAY OFFLINE TREN MAY TINH
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LOI] May tinh chua cai Node.js.
    echo Vui long cai Node.js LTS tai: https://nodejs.org
    echo Sau do nhay dup lai file nay de chay Offline.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [1/3] Dang cai dat thu vien lan dau (can mang 1 lan duy nhat)...
    call npm install
    if %errorlevel% neq 0 (
        echo [LOI] Cai dat thu vien that bai. Kiem tra ket noi mang lan dau.
        pause
        exit /b 1
    )
)

if not exist "dist\index.html" (
    echo [2/3] Dang dong goi ban chay Offline (chi lam 1 lan)...
    call npm run build
    if %errorlevel% neq 0 (
        echo [LOI] Dong goi that bai.
        pause
        exit /b 1
    )
)

echo [3/3] Dang khoi dong may chu noi bo Offline tai http://localhost:3000 ...
set NODE_ENV=production
set PORT=3000

start "" /b cmd /c "npx tsx server.ts"
timeout /t 3 /nobreak >nul

:: Mo dang cua so phan mem Desktop khong thanh dia chi (Edge hoac Chrome)
set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
set "EDGE64=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
set "CHROME86=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"

if exist "%EDGE%" (
    start "" "%EDGE%" --app=http://localhost:3000
) else if exist "%EDGE64%" (
    start "" "%EDGE64%" --app=http://localhost:3000
) else if exist "%CHROME%" (
    start "" "%CHROME%" --app=http://localhost:3000
) else if exist "%CHROME86%" (
    start "" "%CHROME86%" --app=http://localhost:3000
) else (
    start "" "http://localhost:3000"
)

echo.
echo PE SmartPlan 2.0 dang chay OFFLINE!
echo Giu cua so nay mo trong khi su dung. Dong cua so nay de tat ung dung.
echo.
pause
