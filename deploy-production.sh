#!/bin/bash

# Production Deployment Script for Parroquia API
# This script handles the complete deployment process for the production server

set -e

# Configuration
PROJECT_NAME="parroquia-api"
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="./backups"
LOG_FILE="./deployment.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    echo -e "${RED}ERROR: $1${NC}" >&2
    log "ERROR: $1"
    exit 1
}

# Success message
success() {
    echo -e "${GREEN}SUCCESS: $1${NC}"
    log "SUCCESS: $1"
}

# Warning message
warning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
    log "WARNING: $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        error_exit "Docker is not running. Please start Docker first."
    fi
    log "Docker is running"
}

# Check if docker-compose is available
check_compose() {
    if ! command -v docker-compose >/dev/null 2>&1; then
        error_exit "docker-compose is not installed or not in PATH"
    fi
    log "docker-compose is available"
}

# Create backup directory
create_backup_dir() {
    mkdir -p "$BACKUP_DIR"
    log "Backup directory created/verified"
}

# Backup database
backup_database() {
    log "Starting database backup..."
    
    # Check if postgres container is running
    if docker-compose -f "$COMPOSE_FILE" ps postgres | grep -q "Up"; then
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
        
        docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U parroquia_user parroquia_db > "$BACKUP_FILE" || {
            warning "Database backup failed, but continuing with deployment"
            return 0
        }
        
        success "Database backed up to $BACKUP_FILE"
    else
        warning "Postgres container not running, skipping backup"
    fi
}

# Build and deploy
deploy() {
    log "Starting deployment process..."
    
    # Pull latest changes (if using git)
    if [ -d ".git" ]; then
        log "Pulling latest changes from git..."
        git pull origin main || warning "Git pull failed, continuing with local changes"
    fi
    
    # Stop existing containers
    log "Stopping existing containers..."
    docker-compose -f "$COMPOSE_FILE" down || warning "No existing containers to stop"
    
    # Remove old images (optional, comment out if you want to keep them)
    log "Cleaning up old images..."
    docker system prune -f || warning "Docker cleanup failed"
    
    # Build and start services
    log "Building and starting services..."
    docker-compose -f "$COMPOSE_FILE" up --build -d || error_exit "Failed to start services"
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 30
    
    # Check if API is responding
    check_api_health
    
    success "Deployment completed successfully!"
}

# Check API health
check_api_health() {
    log "Checking API health..."
    
    for i in {1..30}; do
        if curl -f http://localhost/api/health >/dev/null 2>&1; then
            success "API is healthy and responding"
            return 0
        fi
        log "Attempt $i: API not ready yet, waiting..."
        sleep 10
    done
    
    error_exit "API health check failed after 5 minutes"
}

# Show logs
show_logs() {
    log "Showing recent logs..."
    docker-compose -f "$COMPOSE_FILE" logs --tail=50
}

# Show status
show_status() {
    log "Current container status:"
    docker-compose -f "$COMPOSE_FILE" ps
}

# Rollback function
rollback() {
    log "Starting rollback process..."
    
    # Stop current containers
    docker-compose -f "$COMPOSE_FILE" down
    
    # You would implement your rollback logic here
    # For example, deploying a previous version
    warning "Rollback functionality needs to be implemented based on your specific needs"
}

# Main deployment function
main() {
    log "Starting production deployment for $PROJECT_NAME"
    
    # Pre-deployment checks
    check_docker
    check_compose
    create_backup_dir
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env.production" ]; then
        warning ".env.production file not found. Please create it with your production environment variables."
        warning "Using default values for now, but you should update them before going live."
    fi
    
    # Backup existing data
    backup_database
    
    # Deploy
    deploy
    
    # Post-deployment verification
    show_status
    
    log "Deployment process completed!"
    echo ""
    echo "=== Deployment Summary ==="
    echo "Project: $PROJECT_NAME"
    echo "Time: $(date)"
    echo "Status: SUCCESS"
    echo ""
    echo "Next steps:"
    echo "1. Update your environment variables in .env.production"
    echo "2. Configure your domain and SSL certificates"
    echo "3. Set up monitoring and logging"
    echo "4. Configure regular backups"
    echo ""
    echo "Useful commands:"
    echo "- View logs: docker-compose -f $COMPOSE_FILE logs -f"
    echo "- Check status: docker-compose -f $COMPOSE_FILE ps"
    echo "- Stop services: docker-compose -f $COMPOSE_FILE down"
    echo "- Restart: docker-compose -f $COMPOSE_FILE restart"
}

# Command line argument handling
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "backup")
        check_docker
        check_compose
        create_backup_dir
        backup_database
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "rollback")
        rollback
        ;;
    "health")
        check_api_health
        ;;
    *)
        echo "Usage: $0 {deploy|backup|logs|status|rollback|health}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Full deployment (default)"
        echo "  backup   - Backup database only"
        echo "  logs     - Show container logs"
        echo "  status   - Show container status"
        echo "  rollback - Rollback deployment"
        echo "  health   - Check API health"
        exit 1
        ;;
esac
