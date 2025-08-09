# Production Deployment Script for Parroquia API (PowerShell)
# This script handles the complete deployment process for the production server on Windows

param(
    [Parameter(Position=0)]
    [ValidateSet("deploy", "backup", "logs", "status", "rollback", "health")]
    [string]$Action = "deploy"
)

# Configuration
$ProjectName = "parroquia-api"
$ComposeFile = "docker-compose.prod.yml"
$BackupDir = ".\backups"
$LogFile = ".\deployment.log"

# Function to write logs
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage
    Add-Content -Path $LogFile -Value $logMessage
}

# Function to write error and exit
function Write-ErrorAndExit {
    param([string]$Message)
    Write-Host "ERROR: $Message" -ForegroundColor Red
    Write-Log "ERROR: $Message"
    exit 1
}

# Function to write success message
function Write-Success {
    param([string]$Message)
    Write-Host "SUCCESS: $Message" -ForegroundColor Green
    Write-Log "SUCCESS: $Message"
}

# Function to write warning message
function Write-Warning {
    param([string]$Message)
    Write-Host "WARNING: $Message" -ForegroundColor Yellow
    Write-Log "WARNING: $Message"
}

# Check if Docker is running
function Test-Docker {
    try {
        docker info | Out-Null
        Write-Log "Docker is running"
    }
    catch {
        Write-ErrorAndExit "Docker is not running. Please start Docker Desktop first."
    }
}

# Check if docker-compose is available
function Test-DockerCompose {
    try {
        docker-compose --version | Out-Null
        Write-Log "docker-compose is available"
    }
    catch {
        Write-ErrorAndExit "docker-compose is not installed or not in PATH"
    }
}

# Create backup directory
function New-BackupDirectory {
    if (!(Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir | Out-Null
    }
    Write-Log "Backup directory created/verified"
}

# Backup database
function Backup-Database {
    Write-Log "Starting database backup..."
    
    try {
        $containers = docker-compose -f $ComposeFile ps postgres
        if ($containers -match "Up") {
            $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
            $backupFile = "$BackupDir\db_backup_$timestamp.sql"
            
            docker-compose -f $ComposeFile exec -T postgres pg_dump -U parroquia_user parroquia_db > $backupFile
            
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Database backed up to $backupFile"
            } else {
                Write-Warning "Database backup failed, but continuing with deployment"
            }
        } else {
            Write-Warning "Postgres container not running, skipping backup"
        }
    }
    catch {
        Write-Warning "Database backup failed: $_"
    }
}

# Build and deploy
function Start-Deployment {
    Write-Log "Starting deployment process..."
    
    # Pull latest changes (if using git)
    if (Test-Path ".git") {
        Write-Log "Pulling latest changes from git..."
        try {
            git pull origin main
        }
        catch {
            Write-Warning "Git pull failed, continuing with local changes"
        }
    }
    
    # Stop existing containers
    Write-Log "Stopping existing containers..."
    try {
        docker-compose -f $ComposeFile down
    }
    catch {
        Write-Warning "No existing containers to stop"
    }
    
    # Remove old images (optional)
    Write-Log "Cleaning up old images..."
    try {
        docker system prune -f
    }
    catch {
        Write-Warning "Docker cleanup failed"
    }
    
    # Build and start services
    Write-Log "Building and starting services..."
    docker-compose -f $ComposeFile up --build -d
    
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorAndExit "Failed to start services"
    }
    
    # Wait for services to be healthy
    Write-Log "Waiting for services to be healthy..."
    Start-Sleep -Seconds 30
    
    # Check if API is responding
    Test-ApiHealth
    
    Write-Success "Deployment completed successfully!"
}

# Check API health
function Test-ApiHealth {
    Write-Log "Checking API health..."
    
    for ($i = 1; $i -le 30; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost/api/health" -TimeoutSec 10 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Success "API is healthy and responding"
                return
            }
        }
        catch {
            Write-Log "Attempt $i`: API not ready yet, waiting..."
            Start-Sleep -Seconds 10
        }
    }
    
    Write-ErrorAndExit "API health check failed after 5 minutes"
}

# Show logs
function Show-Logs {
    Write-Log "Showing recent logs..."
    docker-compose -f $ComposeFile logs --tail=50
}

# Show status
function Show-Status {
    Write-Log "Current container status:"
    docker-compose -f $ComposeFile ps
}

# Rollback function
function Start-Rollback {
    Write-Log "Starting rollback process..."
    
    # Stop current containers
    docker-compose -f $ComposeFile down
    
    # You would implement your rollback logic here
    Write-Warning "Rollback functionality needs to be implemented based on your specific needs"
}

# Main deployment function
function Start-Main {
    Write-Log "Starting production deployment for $ProjectName"
    
    # Pre-deployment checks
    Test-Docker
    Test-DockerCompose
    New-BackupDirectory
    
    # Create .env file if it doesn't exist
    if (!(Test-Path ".env.production")) {
        Write-Warning ".env.production file not found. Please create it with your production environment variables."
        Write-Warning "Using default values for now, but you should update them before going live."
    }
    
    # Backup existing data
    Backup-Database
    
    # Deploy
    Start-Deployment
    
    # Post-deployment verification
    Show-Status
    
    Write-Log "Deployment process completed!"
    Write-Host ""
    Write-Host "=== Deployment Summary ===" -ForegroundColor Cyan
    Write-Host "Project: $ProjectName"
    Write-Host "Time: $(Get-Date)"
    Write-Host "Status: SUCCESS" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Update your environment variables in .env.production"
    Write-Host "2. Configure your domain and SSL certificates"
    Write-Host "3. Set up monitoring and logging"
    Write-Host "4. Configure regular backups"
    Write-Host ""
    Write-Host "Useful commands:" -ForegroundColor Cyan
    Write-Host "- View logs: docker-compose -f $ComposeFile logs -f"
    Write-Host "- Check status: docker-compose -f $ComposeFile ps"
    Write-Host "- Stop services: docker-compose -f $ComposeFile down"
    Write-Host "- Restart: docker-compose -f $ComposeFile restart"
}

# Main execution based on action parameter
switch ($Action) {
    "deploy" {
        Start-Main
    }
    "backup" {
        Test-Docker
        Test-DockerCompose
        New-BackupDirectory
        Backup-Database
    }
    "logs" {
        Show-Logs
    }
    "status" {
        Show-Status
    }
    "rollback" {
        Start-Rollback
    }
    "health" {
        Test-ApiHealth
    }
    default {
        Write-Host "Usage: .\deploy-production.ps1 {deploy|backup|logs|status|rollback|health}" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Commands:"
        Write-Host "  deploy   - Full deployment (default)"
        Write-Host "  backup   - Backup database only"
        Write-Host "  logs     - Show container logs"
        Write-Host "  status   - Show container status"
        Write-Host "  rollback - Rollback deployment"
        Write-Host "  health   - Check API health"
        exit 1
    }
}
