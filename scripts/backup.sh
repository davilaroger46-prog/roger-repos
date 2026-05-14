#!/bin/bash
set -euo pipefail

BACKUP_DIR="/opt/orthostudy/backups"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
FILE="$BACKUP_DIR/orthostudy_$DATE.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Iniciando backup do banco de dados..."

docker compose -f /opt/orthostudy/docker-compose.prod.yml exec -T postgres \
  pg_dump -U orthostudy orthostudy | gzip > "$FILE"

SIZE=$(du -sh "$FILE" | cut -f1)
echo "[$(date)] Backup criado: $FILE ($SIZE)"

# Remove backups antigos
DELETED=$(find "$BACKUP_DIR" -name "orthostudy_*.sql.gz" -mtime +$RETENTION_DAYS -print -delete | wc -l)
echo "[$(date)] Backups removidos (>$RETENTION_DAYS dias): $DELETED"

echo "[$(date)] Backup concluído."
