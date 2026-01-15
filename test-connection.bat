@echo off
title Teste de Conexao - Wraith Inject
color 0B

echo.
echo ════════════════════════════════════════════════
echo   🔍 Diagnostico de Conexao
echo ════════════════════════════════════════════════
echo.

REM Obter IP do PC
echo 📡 Informacoes de Rede:
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4" ^| findstr /v "0.0.0.0"') do (
    set IP=%%a
)
set IP=%IP:~1%
echo ✅ IP do PC: %IP%
echo.

REM Verificar se Node.js está rodando
echo 🔍 Verificando se o servidor esta rodando...
tasklist | findstr /i "node.exe" >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ Servidor Node.js esta rodando
) else (
    echo ❌ Servidor Node.js NAO esta rodando
    echo.
    echo 💡 Execute: start-inject-with-firewall.bat
)
echo.

REM Verificar porta 8888
echo 🔍 Verificando porta 8888...
netstat -an | findstr ":8888" >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ Porta 8888 esta em uso (servidor rodando)
) else (
    echo ❌ Porta 8888 NAO esta em uso
)
echo.

REM Verificar Firewall
echo 🔍 Verificando regras do Firewall...
netsh advfirewall firewall show rule name="Wraith Inject Server" >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ Regra do Firewall configurada
) else (
    echo ⚠️  Regra do Firewall NAO encontrada
    echo.
    echo 💡 Execute: start-inject-with-firewall.bat como Administrador
)
echo.

REM Verificar status do Firewall
echo 🔍 Status do Firewall:
for /f "tokens=3" %%a in ('netsh advfirewall show allprofiles ^| findstr /c:"State"') do (
    echo    %%a
)
echo.

REM Testar conexao local
echo 🔍 Testando conexao local...
curl -s http://localhost:8888/status >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ Servidor responde localmente
) else (
    echo ❌ Servidor NAO responde localmente
)
echo.

echo ════════════════════════════════════════════════
echo   📱 TESTE NO CELULAR
echo ════════════════════════════════════════════════
echo.
echo 1. Conecte o iPhone no mesmo WiFi do PC
echo.
echo 2. Abra o Safari no iPhone
echo.
echo 3. Acesse: http://%IP%:8888/status
echo.
echo 4. Deve aparecer:
echo    {"status":"online","server":"Wraith Inject Server",...}
echo.
echo 5. Se aparecer, esta funcionando! ✅
echo.
echo ════════════════════════════════════════════════
echo.
pause
