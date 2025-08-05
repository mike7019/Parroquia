#!/bin/bash

# Script para enviar notificaciones de despliegue
# Úsalo en Jenkins para notificar sobre el estado del despliegue

WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
DISCORD_WEBHOOK_URL="${DISCORD_WEBHOOK_URL:-}"
DEPLOYMENT_STATUS="$1"
SERVER_IP="$2"
COMMIT_HASH="$3"

# Función para enviar a Slack
send_slack_notification() {
    local status="$1"
    local color="good"
    local icon=":white_check_mark:"
    
    if [ "$status" = "failure" ]; then
        color="danger"
        icon=":x:"
    fi
    
    if [ -n "$WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"title\": \"$icon Despliegue en Producción\",
                    \"fields\": [
                        {\"title\": \"Estado\", \"value\": \"$status\", \"short\": true},
                        {\"title\": \"Servidor\", \"value\": \"$SERVER_IP\", \"short\": true},
                        {\"title\": \"Commit\", \"value\": \"$COMMIT_HASH\", \"short\": true},
                        {\"title\": \"Proyecto\", \"value\": \"Parroquia API\", \"short\": true}
                    ],
                    \"footer\": \"Jenkins CI/CD\",
                    \"ts\": $(date +%s)
                }]
            }" \
            "$WEBHOOK_URL"
    fi
}

# Función para enviar a Discord
send_discord_notification() {
    local status="$1"
    local color=65280  # Verde
    local emoji="✅"
    
    if [ "$status" = "failure" ]; then
        color=16711680  # Rojo
        emoji="❌"
    fi
    
    if [ -n "$DISCORD_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"embeds\": [{
                    \"title\": \"$emoji Despliegue en Producción\",
                    \"color\": $color,
                    \"fields\": [
                        {\"name\": \"Estado\", \"value\": \"$status\", \"inline\": true},
                        {\"name\": \"Servidor\", \"value\": \"$SERVER_IP\", \"inline\": true},
                        {\"name\": \"Commit\", \"value\": \"$COMMIT_HASH\", \"inline\": true},
                        {\"name\": \"Proyecto\", \"value\": \"Parroquia API\", \"inline\": true}
                    ],
                    \"footer\": {\"text\": \"Jenkins CI/CD\"},
                    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"
                }]
            }" \
            "$DISCORD_WEBHOOK_URL"
    fi
}

# Enviar notificaciones
echo "Enviando notificaciones de despliegue..."
send_slack_notification "$DEPLOYMENT_STATUS"
send_discord_notification "$DEPLOYMENT_STATUS"
echo "Notificaciones enviadas"
