@echo off
title Wraith Inject - Configuracao Completa
color 0A

echo.
echo ════════════════════════════════════════════════
echo   🔥 Wraith Inject Server - Setup Completo
echo ════════════════════════════════════════════════
echo.

REM Verificar se esta rodando como administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ⚠️  Este script precisa de permissoes de Administrador!
    echo.
    echo 📋 Clique com botao direito e selecione:
    echo    "Executar como administrador"
    echo.
    pause
    exit /b 1
)

echo ✅ Executando como Administrador
echo.

REM Obter IP do PC
echo 🔍 Detectando IP do PC...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4" ^| findstr /v "0.0.0.0"') do (
    set IP=%%a
)
set IP=%IP:~1%
echo ✅ IP detectado: %IP%
echo.

REM Configurar Firewall
echo 🛡️  Configurando Firewall do Windows...
echo.

REM Remover regra antiga se existir
netsh advfirewall firewall delete rule name="Wraith Inject Server" >nul 2>&1

REM Adicionar nova regra
netsh advfirewall firewall add rule name="Wraith Inject Server" dir=in action=allow protocol=TCP localport=8888 >nul 2>&1

if %errorLevel% equ 0 (
    echo ✅ Firewall configurado com sucesso!
    echo    • Porta 8888 liberada
    echo.
) else (
    echo ⚠️  Erro ao configurar Firewall
    echo.
)

REM Desativar Firewall temporariamente (opcional)
echo 🔓 Desativando Firewall temporariamente para teste...
netsh advfirewall set allprofiles state off >nul 2>&1
echo ✅ Firewall desativado (apenas para teste)
echo.

REM Iniciar servidor
echo 🚀 Iniciando servidor...
echo.

cd /d "%~dp0"
start /B "" node server/inject-stealth.js

timeout /t 3 /nobreak >nul

echo ✅ Servidor iniciado!
echo.
echo ════════════════════════════════════════════════
echo   📱 INFORMAÇÕES PARA O CELULAR
echo ════════════════════════════════════════════════
echo.
echo 📋 Configure no iPhone:
echo    IP do PC: %IP%
echo    Porta: 8888
echo.
echo 🌐 Teste a conexão no navegador do iPhone:
echo    http://%IP%:8888/status
echo.
echo ✅ Se aparecer "status: online" está funcionando!
echo.
echo ════════════════════════════════════════════════
echo.
echo ⚠️  IMPORTANTE:
echo    • Mantenha esta janela ABERTA
echo    • Abra o Notepad antes de injetar
echo    • Celular e PC na mesma rede WiFi
echo.
echo 🛑 Para parar: Feche esta janela ou pressione Ctrl+C
echo.
echo ════════════════════════════════════════════════
echo.

REM Manter janela aberta e mostrar logs
node server/inject-stealth.js
