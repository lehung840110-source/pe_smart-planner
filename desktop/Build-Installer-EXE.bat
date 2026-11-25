@echo off
chcp 65001 >nul
title Dong goi PE SmartPlan 2.0 thanh file cai dat Windows (.exe)
cd /d "%~dp0\.."

echo ==============================================================
echo   DONG GOI PE SMARTPLAN 2.0 THANH FILE CAI DAT (.EXE)
echo ==============================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LOI] Chua cai Node.js. Hay tai Node.js LTS tai https://nodejs.org
    pause
    exit /b 1
)

echo [1/4] Cai dat thu vien du an...
call npm install
if %errorlevel% neq 0 pause & exit /b 1

echo [2/4] Bien dich ung dung web (dist/)...
call npm run build
if %errorlevel% neq 0 pause & exit /b 1

echo [3/4] Cai dat Electron & Electron-Builder de dong goi file .exe...
call npm install --no-save electron electron-builder
if %errorlevel% neq 0 pause & exit /b 1

echo [4/4] Dang tao bo cai dat Windows (.exe) trong thu muc release\ ...
call npx electron-builder --config desktop/electron-builder.json --win
if %errorlevel% neq 0 pause & exit /b 1

echo.
echo ==============================================================
echo   HOAN THANH! Mo thu muc "release" de lay file cai dat (.exe)
echo ==============================================================
explorer release
pause
