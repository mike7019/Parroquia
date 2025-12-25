# Script PowerShell para verificar estructura de base de datos remota
Write-Host "Verificando estructura de base de datos REMOTA" -ForegroundColor Cyan
Write-Host "======================================================================`n"

$remoteHost = "206.62.139.100"
$remotePort = "5433"
$dbUser = "parroquia_user"
$dbName = "parroquia_db"

Write-Host "Conectando a: $remoteHost`:$remotePort" -ForegroundColor Yellow
Write-Host "   Base de datos: $dbName"
Write-Host "   Usuario: $dbUser`n"

# Solicitar contraseña
$password = $env:DB_PASSWORD
if (-not $password) {
    $securePassword = Read-Host "Ingrese la contraseña de PostgreSQL" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

$env:PGPASSWORD = $password

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
    
    try {
        $command = "psql -h $remoteHost -p $remotePort -U $dbUser -d $dbName -c `"\d $table`""
        Invoke-Expression $command
    }
    catch {
        Write-Host "Error al consultar tabla $table" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host "`n======================================================================"
Write-Host "Verificacion completada" -ForegroundColor Green

# Limpiar variable de entorno
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
