@echo off
title Adicionar ao Inicializar do Windows
echo.
echo ════════════════════════════════════════════════
echo   Adicionar Wraith Inject ao Inicializar
echo ════════════════════════════════════════════════
echo.

REM Obter caminho da pasta de inicialização do usuário
set STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

REM Criar atalho para o script VBS
set SCRIPT_PATH=%~dp0start-inject-hidden.vbs
set SHORTCUT_PATH=%STARTUP_FOLDER%\WraithInject.lnk

echo 📝 Criando atalho na pasta de inicialização...
echo.

REM Usar PowerShell para criar o atalho
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT_PATH%'); $Shortcut.TargetPath = 'wscript.exe'; $Shortcut.Arguments = '\"%SCRIPT_PATH%\"'; $Shortcut.WorkingDirectory = '%~dp0'; $Shortcut.WindowStyle = 7; $Shortcut.Save()"

if exist "%SHORTCUT_PATH%" (
    echo ✅ Atalho criado com sucesso!
    echo.
    echo 📂 Local: %STARTUP_FOLDER%
    echo.
    echo 🎯 O servidor agora inicia automaticamente com o Windows!
    echo    • Não precisa executar manualmente
    echo    • Roda em background invisível
    echo    • Você pode fechar esta janela
    echo.
) else (
    echo ❌ Erro ao criar atalho
    echo.
)

echo ════════════════════════════════════════════════
echo.
pause
