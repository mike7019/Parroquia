# Script para verificar estructura de base de datos remota via SSH
Write-Host "Verificando estructura de base de datos REMOTA via SSH" -ForegroundColor Cyan
Write-Host "======================================================================`n"

$remoteServer = "ubuntu@206.62.139.11"
$dbHost = "206.62.139.100"
$dbPort = "5433"
$dbUser = "parroquia_user"
$dbName = "parroquia_db"

Write-Host "Servidor SSH: $remoteServer" -ForegroundColor Yellow
Write-Host "Base de datos: $dbHost`:$dbPort"
Write-Host "DB Name: $dbName"
Write-Host "DB User: $dbUser`n"

# Tablas a verificar
$tables = @(
    'persona_habilidad',
    'persona_destreza',
    'persona_celebracion',
    'persona_enfermedad'
)

foreach ($table in $tables) {
    Write-Host "`nTabla: $table" -ForegroundColor Green
    Write-Host "----------------------------------------------------------------------"
    
    $sshCommand = "PGPASSWORD=`$DB_PASSWORD psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c `"\d $table`""
    
    try {
        ssh $remoteServer $sshCommand
    }
    catch {
        Write-Host "Error al consultar tabla $table" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host "`n======================================================================"
Write-Host "Verificacion completada" -ForegroundColor Green
