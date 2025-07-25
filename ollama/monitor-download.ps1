# Script para monitorear el progreso de descarga del modelo DeepSeek R1

Write-Host "🚀 Monitor de Descarga - DeepSeek R1" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Función para obtener el progreso
function Get-DownloadProgress {
    try {
        $logs = docker logs ollama-deepseek-pull --tail 1 2>$null
        if ($logs -match '"completed":(\d+).*"total":(\d+)') {
            $completed = [long]$matches[1]
            $total = [long]$matches[2]
            
            if ($total -gt 0) {
                $percentage = [math]::Round(($completed / $total) * 100, 2)
                $completedMB = [math]::Round($completed / 1MB, 2)
                $totalMB = [math]::Round($total / 1MB, 2)
                
                return @{
                    Percentage = $percentage
                    CompletedMB = $completedMB
                    TotalMB = $totalMB
                    Completed = $completed
                    Total = $total
                }
            }
        }
        return $null
    }
    catch {
        return $null
    }
}

# Función para mostrar barra de progreso
function Show-ProgressBar {
    param(
        [double]$Percentage,
        [int]$Width = 50
    )
    
    $filled = [math]::Floor($Width * ($Percentage / 100))
    $empty = $Width - $filled
    
    $bar = "█" * $filled + "░" * $empty
    return "[$bar] $($Percentage)%"
}

# Verificar si el contenedor está corriendo
$container = docker ps --filter "name=ollama-deepseek-pull" --format "table {{.Names}}" | Select-String "ollama-deepseek-pull"

if (-not $container) {
    Write-Host "❌ El contenedor de descarga no está corriendo." -ForegroundColor Red
    Write-Host "💡 Inicia con: docker-compose up -d" -ForegroundColor Yellow
    exit
}

Write-Host "⬇️  Monitoreando descarga del modelo DeepSeek R1..." -ForegroundColor Cyan
Write-Host "📦 Tamaño aproximado: ~5.2 GB" -ForegroundColor Gray
Write-Host "⏱️  Presiona Ctrl+C para salir" -ForegroundColor Gray
Write-Host ""

$lastPercentage = 0
$startTime = Get-Date

while ($true) {
    $progress = Get-DownloadProgress
    
    if ($progress) {
        $currentTime = Get-Date
        $elapsed = $currentTime - $startTime
        
        # Calcular velocidad estimada
        if ($progress.Percentage -gt $lastPercentage -and $elapsed.TotalSeconds -gt 0) {
            $speed = ($progress.Completed / $elapsed.TotalSeconds) / 1MB
            $remaining = ($progress.Total - $progress.Completed) / ($speed * 1MB)
            $eta = $currentTime.AddSeconds($remaining).ToString("HH:mm:ss")
        } else {
            $speed = 0
            $eta = "Calculando..."
        }
        
        Clear-Host
        Write-Host "🚀 Monitor de Descarga - DeepSeek R1" -ForegroundColor Green
        Write-Host "=====================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Progreso:" -ForegroundColor Yellow
        Write-Host (Show-ProgressBar -Percentage $progress.Percentage) -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📈 Estadísticas:" -ForegroundColor Yellow
        Write-Host "   Descargado: $($progress.CompletedMB) MB de $($progress.TotalMB) MB" -ForegroundColor White
        Write-Host "   Porcentaje: $($progress.Percentage)%" -ForegroundColor White
        Write-Host "   Velocidad: $([math]::Round($speed, 2)) MB/s" -ForegroundColor White
        Write-Host "   Tiempo transcurrido: $($elapsed.ToString('hh\:mm\:ss'))" -ForegroundColor White
        Write-Host "   ETA: $eta" -ForegroundColor White
        Write-Host ""
        
        if ($progress.Percentage -ge 100) {
            Write-Host "🎉 Descarga completada!" -ForegroundColor Green
            Write-Host "🌐 Ahora puedes usar DeepSeek R1 en http://localhost:5000" -ForegroundColor Green
            break
        }
        
        $lastPercentage = $progress.Percentage
    } else {
        Write-Host "⏳ Esperando inicio de descarga..." -ForegroundColor Yellow
    }
    
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "✅ Para usar el modelo:" -ForegroundColor Green
Write-Host "   1. Ve a http://localhost:5000" -ForegroundColor White
Write-Host "   2. Crea tu cuenta de administrador" -ForegroundColor White
Write-Host "   3. Comienza a chatear con DeepSeek R1!" -ForegroundColor White
