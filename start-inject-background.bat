@echo off
title Wraith Inject - Iniciando em Background
echo.
echo ════════════════════════════════════════════════
echo   🔥 Wraith Inject Server - Background Mode
echo ════════════════════════════════════════════════
echo.
echo 🚀 Iniciando servidor em background...
echo.

REM Iniciar o servidor em background usando VBScript
start /B wscript.exe "%~dp0start-inject-hidden.vbs"

timeout /t 3 /nobreak >nul

echo ✅ Servidor iniciado em background!
echo.
echo 📋 O servidor está rodando invisível
echo    • Porta: 8888
echo    • Você pode fechar esta janela
echo.
echo 🛑 Para parar o servidor:
echo    • Abra o Gerenciador de Tarefas
echo    • Finalize o processo "node.exe"
echo.
echo ════════════════════════════════════════════════
echo.
pause
