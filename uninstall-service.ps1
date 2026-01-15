# Script para desinstalar o Wraith Inject Server
# Execute como Administrador

$serviceName = "WraithInjectServer"

Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Desinstalador do Wraith Inject Server" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Verificar se está executando como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "❌ ERRO: Execute este script como Administrador!" -ForegroundColor Red
    pause
    exit 1
}

# Verificar se o serviço existe
$service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
if (-not $service) {
    Write-Host "⚠️  Serviço não encontrado. Nada para desinstalar." -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 0
}

Write-Host "📋 Serviço encontrado: $serviceName" -ForegroundColor White
Write-Host "   Status: $($service.Status)" -ForegroundColor Gray
Write-Host ""

# Parar o serviço
if ($service.Status -eq "Running") {
    Write-Host "🛑 Parando serviço..." -ForegroundColor Yellow
    Stop-Service -Name $serviceName -Force
    Start-Sleep -Seconds 2
    Write-Host "✅ Serviço parado" -ForegroundColor Green
    Write-Host ""
}

# Remover o serviço
Write-Host "🗑️  Removendo serviço..." -ForegroundColor Yellow
sc.exe delete $serviceName

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Serviço removido com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao remover serviço" -ForegroundColor Red
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ DESINSTALAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
pause
