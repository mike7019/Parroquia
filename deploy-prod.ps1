# Parroquia Production Deployment Script for Windows
# This script deploys the application using Docker with PM2 and Nginx
# Version: 2.0
# Updated: August 2, 2025

param(
    [Parameter(Position=0)]
    [ValidateSet("deploy", "logs", "status", "stop", "restart", "backup", "clean", "update", "scale", "monitor", "ssl", "help")]
    [string]$Command = "help",
    
    [Parameter(Position=1)]
    [string]$Options = "",
    
    [switch]$Force,
    [switch]$Verbose
)

# Global variables
$ComposeFile = "docker-compose.prod.yml"
$LogFile = "deployment-$(Get-Date -Format 'yyyyMMdd').log"
$BackupDir = "backups"
$EnvFile = ".env"

# Function to write to log file
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Add-Content -Path $LogFile -Value $logEntry
    
    if ($Verbose) {
        Write-Host $logEntry -ForegroundColor Gray
    }
}

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
    Write-Log $Message "INFO"
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
    Write-Log $Message "SUCCESS"
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
    Write-Log $Message "WARNING"
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
    Write-Log $Message "ERROR"
}

# Function to check prerequisites
function Test-Prerequisites {
    Write-Status "Checking prerequisites..."
    
    $errors = @()
    
    # Check Docker
    try {
        $dockerVersion = docker --version 2>$null
        if (-not $dockerVersion) {
            $errors += "Docker is not installed or not in PATH"
        } else {
            Write-Status "Docker found: $dockerVersion"
        }
    }
    catch {
        $errors += "Docker is not accessible"
    }
    
    # Check Docker Compose
    try {
        $composeVersion = docker-compose --version 2>$null
        if (-not $composeVersion) {
            $errors += "Docker Compose is not installed or not in PATH"
        } else {
            Write-Status "Docker Compose found: $composeVersion"
        }
    }
    catch {
        $errors += "Docker Compose is not accessible"
    }
    
    # Check if Docker daemon is running
    try {
        docker info 2>$null | Out-Null
        Write-Status "Docker daemon is running"
    }
    catch {
        $errors += "Docker daemon is not running"
    }
    
    # Check required files
    $requiredFiles = @($ComposeFile, "Dockerfile.pm2", "nginx.docker.conf", "ecosystem.config.js")
    foreach ($file in $requiredFiles) {
        if (-not (Test-Path $file)) {
            $errors += "Required file missing: $file"
        }
    }
    
    # Check disk space (minimum 2GB)
    $drive = (Get-Location).Drive
    $freeSpace = (Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='$($drive.Name)'").FreeSpace / 1GB
    if ($freeSpace -lt 2) {
        $errors += "Insufficient disk space. Available: $([math]::Round($freeSpace, 2))GB, Required: 2GB"
    }
    
    if ($errors.Count -gt 0) {
        Write-ErrorMsg "Prerequisites check failed:"
        foreach ($error in $errors) {
            Write-ErrorMsg "  - $error"
        }
        return $false
    }
    
    Write-Success "All prerequisites met"
    return $true
}

# Function to check if Docker is running
function Test-Docker {
    Write-Status "Checking Docker status..."
    
    try {
        docker info 2>$null | Out-Null
        $containers = docker ps -q 2>$null
        Write-Success "Docker is running. Active containers: $($containers.Count)"
        return $true
    }
    catch {
        Write-ErrorMsg "Docker daemon is not running or accessible"
        return $false
    }
}

# Function to validate environment configuration
function Test-Environment {
    Write-Status "Validating environment configuration..."
    
    if (-not (Test-Path $EnvFile)) {
        Write-Warning "Environment file not found. Creating from template..."
        New-EnvFile
        Write-Warning "Please update the .env file with your actual configuration before deploying!"
        return $false
    }
    
    # Read and validate critical environment variables
    $envContent = Get-Content $EnvFile -Raw
    $requiredVars = @("JWT_SECRET", "JWT_REFRESH_SECRET", "DB_PASS")
    $warnings = @()
    
    foreach ($var in $requiredVars) {
        if ($envContent -match "$var=.*default.*" -or $envContent -match "$var=your_.*") {
            $warnings += "Please update $var with a secure value"
        }
    }
    
    if ($warnings.Count -gt 0) {
        Write-Warning "Environment configuration warnings:"
        foreach ($warning in $warnings) {
            Write-Warning "  - $warning"
        }
        
        if (-not $Force) {
            $response = Read-Host "Continue anyway? (y/N)"
            if ($response -ne "y" -and $response -ne "Y") {
                return $false
            }
        }
    }
    
    Write-Success "Environment configuration validated"
    return $true
}

# Function to create environment file if it doesn't exist
function New-EnvFile {
    if (-not (Test-Path $EnvFile)) {
        Write-Status "Creating environment file..."
        
        # Generate secure secrets
        $jwtSecret = [System.Web.Security.Membership]::GeneratePassword(64, 16)
        $refreshSecret = [System.Web.Security.Membership]::GeneratePassword(64, 16)
        
        $envContent = @"
# Production Environment Variables
# Generated on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
NODE_ENV=production
PORT=3000

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=parroquia_db
DB_USER=parroquia_user
DB_PASS=ParroquiaSecure2025

# JWT Configuration (Auto-generated secure secrets)
JWT_SECRET=$jwtSecret
JWT_REFRESH_SECRET=$refreshSecret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12

# Frontend Configuration
FRONTEND_URL=http://206.62.139.100

# Email Configuration (Optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
SMTP_FROM_EMAIL=
SEND_REAL_EMAILS=false

# Logging
VERBOSE_LOGGING=true

# Generated on: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
"@
        
        $envContent | Out-File -FilePath $EnvFile -Encoding UTF8
        Write-Success "Created .env file with auto-generated secure secrets"
        Write-Warning "Please review and update email configuration if needed"
    }
    else {
        Write-Status "Environment file already exists"
    }
}

# Function to build and deploy
function Start-Deployment {
    Write-Status "Starting production deployment..."
    
    try {
        # Pre-deployment cleanup
        Write-Status "Performing pre-deployment cleanup..."
        if (Test-Path "temp/*") {
            Remove-Item "temp/*" -Recurse -Force -ErrorAction SilentlyContinue
        }
        
        # Stop existing containers gracefully
        Write-Status "Stopping existing containers..."
        docker-compose -f $ComposeFile down --timeout 30 2>$null
        
        # Clean up unused Docker resources
        Write-Status "Cleaning up Docker resources..."
        docker system prune -f --volumes 2>$null
        
        # Pull latest images
        Write-Status "Pulling latest base images..."
        docker-compose -f $ComposeFile pull --ignore-pull-failures
        
        # Build and start containers
        Write-Status "Building and starting containers..."
        $buildOutput = docker-compose -f $ComposeFile up -d --build --remove-orphans 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-ErrorMsg "Deployment failed during container startup"
            Write-ErrorMsg $buildOutput
            return $false
        }
        
        # Wait for services to be healthy
        Write-Status "Waiting for services to be ready..."
        $maxWait = 120 # 2 minutes
        $waited = 0
        $interval = 10
        
        do {
            Start-Sleep -Seconds $interval
            $waited += $interval
            
            $healthStatus = docker-compose -f $ComposeFile ps --format json | ConvertFrom-Json
            $unhealthyServices = $healthStatus | Where-Object { $_.Health -ne "healthy" -and $_.Health -ne "" }
            
            if ($unhealthyServices.Count -eq 0) {
                break
            }
            
            Write-Status "Waiting for services... ($waited/$maxWait seconds)"
            
        } while ($waited -lt $maxWait)
        
        # Final health check
        Write-Status "Performing final health checks..."
        $services = docker-compose -f $ComposeFile ps --format json | ConvertFrom-Json
        $allHealthy = $true
        
        foreach ($service in $services) {
            if ($service.State -ne "running") {
                Write-ErrorMsg "Service $($service.Service) is not running (State: $($service.State))"
                $allHealthy = $false
            }
        }
        
        if (-not $allHealthy) {
            Write-ErrorMsg "Some services failed to start properly"
            Show-Status
            return $false
        }
        
        # Test API connectivity
        Write-Status "Testing API connectivity..."
        try {
            $response = Invoke-WebRequest -Uri "http://206.62.139.100/api/health" -TimeoutSec 10 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Success "API health check passed"
            } else {
                Write-Warning "API returned status code: $($response.StatusCode)"
            }
        }
        catch {
            Write-Warning "API health check failed: $($_.Exception.Message)"
        }
        
        # Show final status
        Show-Status
        
        Write-Success "Deployment completed successfully!"
        Write-Status "Application is available at: http://206.62.139.100"
        Write-Status "API documentation: http://206.62.139.100/api-docs"
        Write-Status "Health check: http://206.62.139.100/api/health"
        
        return $true
    }
    catch {
        Write-ErrorMsg "Deployment failed: $($_.Exception.Message)"
        return $false
    }
}

# Function to show logs
function Show-Logs {
    param([string]$Service = "")
    
    if ($Service) {
        Write-Status "Showing logs for service: $Service"
        docker-compose -f $ComposeFile logs -f --tail=100 $Service
    } else {
        Write-Status "Showing application logs..."
        docker-compose -f $ComposeFile logs -f --tail=100
    }
}

# Function to show comprehensive status
function Show-Status {
    Write-Status "=== Container Status ==="
    docker-compose -f $ComposeFile ps
    
    Write-Status "`n=== Resource Usage ==="
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
    
    Write-Status "`n=== Network Status ==="
    $networks = docker network ls --filter name=parroquia --format "{{.Name}}"
    foreach ($network in $networks) {
        Write-Status "Network: $network"
        docker network inspect $network --format "{{range .Containers}}{{.Name}}: {{.IPv4Address}}{{end}}"
    }
    
    Write-Status "`n=== Volume Status ==="
    docker volume ls --filter name=parroquia --format "table {{.Driver}}\t{{.Name}}"
    
    Write-Status "`n=== Service Health ==="
    try {
        $response = Invoke-WebRequest -Uri "http://206.62.139.100/api/health" -TimeoutSec 5 -UseBasicParsing
        Write-Success "API Health: OK (Status: $($response.StatusCode))"
    }
    catch {
        Write-Warning "API Health: FAILED ($($_.Exception.Message))"
    }
    
    try {
        $response = Invoke-WebRequest -Uri "http://206.62.139.100/nginx-health" -TimeoutSec 5 -UseBasicParsing
        Write-Success "Nginx Health: OK (Status: $($response.StatusCode))"
    }
    catch {
        Write-Warning "Nginx Health: FAILED ($($_.Exception.Message))"
    }
}

# Function to stop services
function Stop-Services {
    Write-Status "Stopping all services..."
    docker-compose -f $ComposeFile down --timeout 30
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Services stopped successfully"
    } else {
        Write-ErrorMsg "Failed to stop some services"
    }
}

# Function to restart services
function Restart-Services {
    param([string]$Service = "")
    
    if ($Service) {
        Write-Status "Restarting service: $Service"
        docker-compose -f $ComposeFile restart $Service
    } else {
        Write-Status "Restarting all services..."
        docker-compose -f $ComposeFile restart
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Services restarted successfully"
        Start-Sleep -Seconds 10
        Show-Status
    } else {
        Write-ErrorMsg "Failed to restart services"
    }
}

# Function to scale services
function Set-Scale {
    param([string]$ServiceScale)
    
    if (-not $ServiceScale) {
        Write-ErrorMsg "Please specify service and scale (e.g., 'api=3')"
        return
    }
    
    Write-Status "Scaling services: $ServiceScale"
    docker-compose -f $ComposeFile up -d --scale $ServiceScale --no-recreate
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Scaling completed"
        Show-Status
    } else {
        Write-ErrorMsg "Scaling failed"
    }
}

# Function to clean up Docker resources
function Invoke-Cleanup {
    Write-Status "Performing Docker cleanup..."
    
    if ($Force) {
        Write-Warning "Force cleanup - removing all unused resources"
        docker system prune -af --volumes
    } else {
        Write-Status "Standard cleanup - removing unused images and containers"
        docker system prune -f
    }
    
    Write-Status "Cleanup completed"
    docker system df
}

# Function to update application
function Update-Application {
    Write-Status "Updating application..."
    
    # Git pull if in git repository
    if (Test-Path ".git") {
        Write-Status "Pulling latest code..."
        git pull origin develop
    }
    
    # Rebuild and deploy
    Start-Deployment
}

# Function to monitor services
function Start-Monitoring {
    Write-Status "Starting service monitoring..."
    Write-Status "Press Ctrl+C to stop monitoring"
    
    try {
        while ($true) {
            Clear-Host
            Write-Host "=== Parroquia Production Monitor ===" -ForegroundColor Cyan
            Write-Host "Updated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
            Write-Host ""
            
            Show-Status
            
            Start-Sleep -Seconds 30
        }
    }
    catch {
        Write-Status "Monitoring stopped"
    }
}

# Function to backup database
function Backup-Database {
    Write-Status "Creating database backup..."
    
    if (-not (Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir | Out-Null
    }
    
    $timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
    $backupFile = "$BackupDir\parroquia_backup_$timestamp.sql"
    $metadataFile = "$BackupDir\parroquia_backup_$timestamp.json"
    
    try {
        # Create database backup
        Write-Status "Exporting database..."
        $backupCommand = "docker-compose -f $ComposeFile exec -T postgres pg_dump -U parroquia_user -d parroquia_db --clean --if-exists"
        Invoke-Expression $backupCommand | Out-File -FilePath $backupFile -Encoding UTF8
        
        # Create metadata file
        $metadata = @{
            timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            database = "parroquia_db"
            user = "parroquia_user"
            size_mb = [math]::Round((Get-Item $backupFile).Length / 1MB, 2)
            containers = (docker-compose -f $ComposeFile ps --format json | ConvertFrom-Json | ForEach-Object { $_.Service })
        }
        
        $metadata | ConvertTo-Json -Depth 3 | Out-File -FilePath $metadataFile -Encoding UTF8
        
        # Compress backup
        Write-Status "Compressing backup..."
        $zipFile = "$BackupDir\parroquia_backup_$timestamp.zip"
        Compress-Archive -Path $backupFile, $metadataFile -DestinationPath $zipFile -Force
        
        # Clean up uncompressed files
        Remove-Item $backupFile, $metadataFile -Force
        
        Write-Success "Database backup created: $zipFile"
        Write-Status "Backup size: $([math]::Round((Get-Item $zipFile).Length / 1MB, 2)) MB"
        
        # Keep only last 10 backups
        $backups = Get-ChildItem "$BackupDir\parroquia_backup_*.zip" | Sort-Object CreationTime -Descending
        if ($backups.Count -gt 10) {
            $oldBackups = $backups | Select-Object -Skip 10
            $oldBackups | Remove-Item -Force
            Write-Status "Cleaned up $($oldBackups.Count) old backups"
        }
    }
    catch {
        Write-ErrorMsg "Backup failed: $($_.Exception.Message)"
    }
}

# Function to setup SSL (placeholder for future implementation)
function Set-SSL {
    Write-Warning "SSL setup is not yet implemented"
    Write-Status "For now, please configure SSL manually using:"
    Write-Status "1. Obtain SSL certificates from Let's Encrypt or your provider"
    Write-Status "2. Mount certificates in nginx container"
    Write-Status "3. Update nginx.docker.conf with SSL configuration"
}

# Function to show help
function Show-Help {
    Write-Host "Parroquia Production Deployment Script for Windows" -ForegroundColor Cyan
    Write-Host "Version 2.0 - Updated August 2, 2025" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Usage: .\deploy-prod.ps1 [command] [options] [-Force] [-Verbose]" -ForegroundColor White
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor White
    Write-Host "  deploy      - Full deployment with health checks" -ForegroundColor Gray
    Write-Host "  logs        - Show application logs (use 'logs api' for specific service)" -ForegroundColor Gray
    Write-Host "  status      - Show comprehensive system status" -ForegroundColor Gray
    Write-Host "  stop        - Stop all services gracefully" -ForegroundColor Gray
    Write-Host "  restart     - Restart services (use 'restart api' for specific service)" -ForegroundColor Gray
    Write-Host "  backup      - Create compressed database backup" -ForegroundColor Gray
    Write-Host "  clean       - Clean up Docker resources" -ForegroundColor Gray
    Write-Host "  update      - Update code and redeploy" -ForegroundColor Gray
    Write-Host "  scale       - Scale services (e.g., 'scale api=3')" -ForegroundColor Gray
    Write-Host "  monitor     - Real-time system monitoring" -ForegroundColor Gray
    Write-Host "  ssl         - SSL setup instructions" -ForegroundColor Gray
    Write-Host "  help        - Show this help message" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Options:" -ForegroundColor White
    Write-Host "  -Force      - Skip confirmation prompts" -ForegroundColor Gray
    Write-Host "  -Verbose    - Enable verbose logging" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor White
    Write-Host "  .\deploy-prod.ps1 deploy -Verbose" -ForegroundColor Gray
    Write-Host "  .\deploy-prod.ps1 logs api" -ForegroundColor Gray
    Write-Host "  .\deploy-prod.ps1 scale api=3" -ForegroundColor Gray
    Write-Host "  .\deploy-prod.ps1 clean -Force" -ForegroundColor Gray
    Write-Host ""
}

# Main script logic
Write-Host "=== Parroquia Production Deployment Script ===" -ForegroundColor Cyan
Write-Host "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

# Initialize logging
Write-Log "Script started with command: $Command" "INFO"

switch ($Command) {
    "deploy" {
        if (Test-Prerequisites -and Test-Environment) {
            if (Start-Deployment) {
                Write-Log "Deployment completed successfully" "SUCCESS"
            } else {
                Write-Log "Deployment failed" "ERROR"
                exit 1
            }
        } else {
            Write-ErrorMsg "Prerequisites or environment validation failed"
            exit 1
        }
    }
    "logs" {
        Show-Logs -Service $Options
    }
    "status" {
        if (Test-Docker) {
            Show-Status
        }
    }
    "stop" {
        Stop-Services
    }
    "restart" {
        if (Test-Docker) {
            Restart-Services -Service $Options
        }
    }
    "backup" {
        if (Test-Docker) {
            Backup-Database
        }
    }
    "clean" {
        Invoke-Cleanup
    }
    "update" {
        if (Test-Prerequisites -and Test-Environment) {
            Update-Application
        }
    }
    "scale" {
        if (Test-Docker -and $Options) {
            Set-Scale -ServiceScale $Options
        } else {
            Write-ErrorMsg "Please specify scaling options (e.g., 'api=3')"
        }
    }
    "monitor" {
        if (Test-Docker) {
            Start-Monitoring
        }
    }
    "ssl" {
        Set-SSL
    }
    "help" {
        Show-Help
    }
    default {
        Show-Help
    }
}

Write-Log "Script completed with command: $Command" "INFO"
