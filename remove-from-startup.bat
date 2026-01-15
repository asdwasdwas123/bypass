@echo off
title Remover do Inicializar do Windows
echo.
echo ════════════════════════════════════════════════
echo   Remover Wraith Inject do Inicializar
echo ════════════════════════════════════════════════
echo.

REM Obter caminho da pasta de inicialização do usuário
set STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
set SHORTCUT_PATH=%STARTUP_FOLDER%\WraithInject.lnk

if exist "%SHORTCUT_PATH%" (
    echo 🗑️  Removendo atalho da pasta de inicialização...
    del "%SHORTCUT_PATH%"
    echo.
    echo ✅ Atalho removido com sucesso!
    echo.
    echo 🎯 O servidor não iniciará mais automaticamente com o Windows
    echo.
) else (
    echo ⚠️  Atalho não encontrado na pasta de inicialização
    echo.
)

echo ════════════════════════════════════════════════
echo.
pause
