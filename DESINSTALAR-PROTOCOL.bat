@echo off
chcp 65001 >nul
color 0C
title Wraith Inject - Desinstalador

echo.
echo ═══════════════════════════════════════════════
echo   🗑️  WRAITH INJECT - DESINSTALADOR
echo ═══════════════════════════════════════════════
echo.

REM Verificar Admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Execute como Administrador!
    pause
    exit /b 1
)

echo 🗑️  Removendo protocol handler...
reg delete "HKEY_CLASSES_ROOT\wraith-inject" /f >nul 2>&1

if %errorLevel% equ 0 (
    echo ✅ Protocol handler removido!
) else (
    echo ⚠️  Nada para remover
)

echo.
echo ✅ Desinstalação concluída!
echo.
pause
