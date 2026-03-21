#!/bin/bash
# scripts/restore.sh — Restore from backup

set -e

if [ -z "$1" ]; then
  echo "Usage: ./scripts/restore.sh <backup-file>"
  exit 1
fi

BACKUP_FILE="$1"
RESTORE_DIR="/tmp/athena-restore"

echo "=== Athena AI Restore ==="

# Decrypt if encrypted
if [[ "$BACKUP_FILE" == *.gpg ]]; then
  echo "Decrypting backup..."
  gpg --batch --passphrase "$BACKUP_ENCRYPTION_KEY" -d "$BACKUP_FILE" > "${BACKUP_FILE%.gpg}"
  BACKUP_FILE="${BACKUP_FILE%.gpg}"
fi

# Extract
echo "Extracting backup..."
mkdir -p "$RESTORE_DIR"
tar -xzf "$BACKUP_FILE" -C "$RESTORE_DIR" --strip-components=1

# Restore database
echo "Restoring database..."
docker compose exec -T postgres psql -U nexus -d nexus_db < "$RESTORE_DIR/database.sql"

# Restore uploads
if [ -d "$RESTORE_DIR/uploads" ]; then
  echo "Restoring uploads..."
  docker cp "$RESTORE_DIR/uploads" athena-app:/app/data/
fi

# Cleanup
rm -rf "$RESTORE_DIR"

echo "Restore complete!"
