@echo off
title Wraith Inject - INICIO AQUI
color 0A
cls

echo.
echo ════════════════════════════════════════════════
echo   🔥 WRAITH INJECT - CONFIGURACAO COMPLETA
echo ════════════════════════════════════════════════
echo.

REM Verificar administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ⚠️  ATENCAO: Precisa de permissoes de Administrador!
    echo.
    echo 📋 Clique com botao direito neste arquivo e selecione:
    echo    "Executar como administrador"
    echo.
    echo Pressione qualquer tecla para tentar continuar mesmo assim...
    pause >nul
    echo.
)

echo ✅ Iniciando configuracao...
echo.

REM Matar processos node antigos
echo 🛑 Parando servidores antigos...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo ✅ Processos antigos finalizados
echo.

REM Obter IP
echo 🔍 Detectando IP do PC...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4" ^| findstr /v "0.0.0.0" ^| findstr /v "127.0.0.1"') do (
    set IP=%%a
    goto :found_ip
)
:found_ip
set IP=%IP:~1%
echo ✅ IP detectado: %IP%
echo.

REM Configurar Firewall
echo 🛡️  Configurando Firewall...
netsh advfirewall firewall delete rule name="Wraith Inject" >nul 2>&1
netsh advfirewall firewall add rule name="Wraith Inject" dir=in action=allow protocol=TCP localport=8888 >nul 2>&1
echo ✅ Firewall configurado (porta 8888 liberada)
echo.

REM Desativar Firewall temporariamente
echo 🔓 Desativando Firewall para garantir conexao...
netsh advfirewall set allprofiles state off >nul 2>&1
echo ✅ Firewall desativado
echo.

REM Iniciar servidor
echo 🚀 Iniciando servidor...
cd /d "%~dp0"
start /B "" node server/inject-stealth.js
timeout /t 3 /nobreak >nul
echo ✅ Servidor iniciado!
echo.

echo ════════════════════════════════════════════════
echo   📱 CONFIGURACAO NO CELULAR (iPhone)
echo ════════════════════════════════════════════════
echo.
echo 1️⃣  Conecte o iPhone no MESMO WiFi do PC
echo.
echo 2️⃣  Abra o Safari no iPhone
echo.
echo 3️⃣  Teste a conexao acessando:
echo     http://%IP%:8888/status
echo.
echo 4️⃣  Deve aparecer:
echo     {"status":"online",...}
echo.
echo 5️⃣  Se aparecer, acesse o site:
echo     bypass-6p9m.vercel.app
echo.
echo 6️⃣  Clique na engrenagem e digite:
echo     %IP%
echo.
echo 7️⃣  Abra o NOTEPAD no PC
echo.
echo 8️⃣  Clique em "Injetar" no site
echo.
echo ════════════════════════════════════════════════
echo.
echo ✅ TUDO CONFIGURADO!
echo.
echo 📋 Mantenha esta janela ABERTA
echo 🛑 Para parar: Feche esta janela ou Ctrl+C
echo.
echo ════════════════════════════════════════════════
echo.
echo Aguardando requisicoes...
echo.

REM Mostrar logs do servidor
node server/inject-stealth.js
