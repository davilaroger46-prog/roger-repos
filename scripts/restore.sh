#!/bin/bash
set -euo pipefail

BACKUP_FILE="${1:-}"

if [ -z "$BACKUP_FILE" ]; then
  echo "Uso: ./restore.sh <arquivo_backup.sql.gz>"
  echo ""
  echo "Backups disponíveis:"
  ls -lh /opt/orthostudy/backups/*.sql.gz 2>/dev/null || echo "Nenhum backup encontrado."
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Arquivo não encontrado: $BACKUP_FILE"
  exit 1
fi

echo "[$(date)] ATENÇÃO: Esta operação vai APAGAR o banco atual e restaurar o backup."
read -p "Confirmar? (s/N) " CONFIRM

if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
  echo "Operação cancelada."
  exit 0
fi

echo "[$(date)] Restaurando backup: $BACKUP_FILE"

zcat "$BACKUP_FILE" | docker compose -f /opt/orthostudy/docker-compose.prod.yml exec -T postgres \
  psql -U orthostudy -d orthostudy

echo "[$(date)] Restore concluído."
