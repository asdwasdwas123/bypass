# Script para instalar o Wraith Inject Server como serviço do Windows
# Execute como Administrador

$serviceName = "WraithInjectServer"
$serviceDisplayName = "Wraith Inject Server"
$serviceDescription = "Servidor de injeção Wraith Bypass em modo stealth"
$scriptPath = $PSScriptRoot
$nodePath = (Get-Command node).Source
$serverScript = Join-Path $scriptPath "server\inject-stealth.js"

Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Instalador do Wraith Inject Server" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Verificar se está executando como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "❌ ERRO: Execute este script como Administrador!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Clique com botão direito no arquivo e selecione 'Executar como administrador'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ Executando como Administrador" -ForegroundColor Green
Write-Host ""

# Verificar se o serviço já existe
$existingService = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
if ($existingService) {
    Write-Host "⚠️  Serviço já existe. Removendo..." -ForegroundColor Yellow
    Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    sc.exe delete $serviceName
    Start-Sleep -Seconds 2
    Write-Host "✅ Serviço antigo removido" -ForegroundColor Green
    Write-Host ""
}

# Verificar se Node.js está instalado
if (-not (Test-Path $nodePath)) {
    Write-Host "❌ ERRO: Node.js não encontrado!" -ForegroundColor Red
    Write-Host "Instale o Node.js primeiro: https://nodejs.org" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ Node.js encontrado: $nodePath" -ForegroundColor Green
Write-Host ""

# Verificar se o script do servidor existe
if (-not (Test-Path $serverScript)) {
    Write-Host "❌ ERRO: Arquivo do servidor não encontrado!" -ForegroundColor Red
    Write-Host "Caminho esperado: $serverScript" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ Script do servidor encontrado" -ForegroundColor Green
Write-Host ""

# Criar arquivo batch para iniciar o servidor
$batchFile = Join-Path $scriptPath "start-inject-service.bat"
$batchContent = @"
@echo off
cd /d "$scriptPath"
"$nodePath" "$serverScript"
"@
Set-Content -Path $batchFile -Value $batchContent -Encoding ASCII

Write-Host "📝 Criando serviço do Windows..." -ForegroundColor Cyan

# Criar o serviço usando NSSM (Non-Sucking Service Manager) ou sc.exe
# Vamos usar sc.exe que já vem no Windows
$binaryPath = "cmd.exe /c `"$batchFile`""

$createResult = sc.exe create $serviceName binPath= $binaryPath start= auto DisplayName= $serviceDisplayName
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERRO ao criar serviço!" -ForegroundColor Red
    Write-Host $createResult
    pause
    exit 1
}

# Configurar descrição do serviço
sc.exe description $serviceName $serviceDescription

# Configurar para reiniciar automaticamente em caso de falha
sc.exe failure $serviceName reset= 86400 actions= restart/60000/restart/60000/restart/60000

Write-Host "✅ Serviço criado com sucesso!" -ForegroundColor Green
Write-Host ""

# Iniciar o serviço
Write-Host "🚀 Iniciando serviço..." -ForegroundColor Cyan
Start-Service -Name $serviceName

Start-Sleep -Seconds 2

# Verificar status
$service = Get-Service -Name $serviceName
if ($service.Status -eq "Running") {
    Write-Host "✅ Serviço iniciado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Serviço criado mas não está rodando" -ForegroundColor Yellow
    Write-Host "Status: $($service.Status)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ INSTALAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Informações do Serviço:" -ForegroundColor White
Write-Host "   Nome: $serviceName" -ForegroundColor Gray
Write-Host "   Status: $($service.Status)" -ForegroundColor Gray
Write-Host "   Porta: 8888" -ForegroundColor Gray
Write-Host ""
Write-Host "🎯 O servidor agora roda automaticamente em background!" -ForegroundColor Green
Write-Host "   • Inicia automaticamente com o Windows" -ForegroundColor Gray
Write-Host "   • Não precisa manter CMD aberto" -ForegroundColor Gray
Write-Host "   • Reinicia automaticamente se cair" -ForegroundColor Gray
Write-Host ""
Write-Host "📱 Para usar:" -ForegroundColor White
Write-Host "   1. Abra o Notepad no PC" -ForegroundColor Gray
Write-Host "   2. Acesse o site no celular" -ForegroundColor Gray
Write-Host "   3. Configure IP: $((Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like '*Wi-Fi*'}).IPAddress)" -ForegroundColor Gray
Write-Host "   4. Clique em 'Injetar'" -ForegroundColor Gray
Write-Host ""
Write-Host "🛠️  Comandos úteis:" -ForegroundColor White
Write-Host "   Parar serviço:     Stop-Service -Name $serviceName" -ForegroundColor Gray
Write-Host "   Iniciar serviço:   Start-Service -Name $serviceName" -ForegroundColor Gray
Write-Host "   Status:            Get-Service -Name $serviceName" -ForegroundColor Gray
Write-Host "   Desinstalar:       Execute uninstall-service.ps1" -ForegroundColor Gray
Write-Host ""
pause
