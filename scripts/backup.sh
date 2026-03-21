#!/bin/bash
# scripts/backup.sh — Database + files backup

set -e

BACKUP_DIR="/tmp/athena-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "=== Athena AI Backup ==="

# Dump database
echo "Backing up database..."
docker compose exec -T postgres pg_dump -U nexus nexus_db > "$BACKUP_DIR/database.sql"

# Copy uploads
echo "Backing up uploads..."
docker cp athena-app:/app/data/uploads "$BACKUP_DIR/uploads" 2>/dev/null || echo "No uploads to backup"

# Create archive
echo "Creating archive..."
tar -czf "$BACKUP_DIR.tar.gz" -C "$(dirname $BACKUP_DIR)" "$(basename $BACKUP_DIR)"

# Encrypt if key is available
if [ -n "$BACKUP_ENCRYPTION_KEY" ]; then
  echo "Encrypting backup..."
  gpg --batch --yes --passphrase "$BACKUP_ENCRYPTION_KEY" -c "$BACKUP_DIR.tar.gz"
  rm "$BACKUP_DIR.tar.gz"
  BACKUP_FILE="$BACKUP_DIR.tar.gz.gpg"
else
  BACKUP_FILE="$BACKUP_DIR.tar.gz"
fi

# Upload to S3 if configured
if [ -n "$BACKUP_S3_ENDPOINT" ]; then
  echo "Uploading to S3..."
  rclone copy "$BACKUP_FILE" remote:$BACKUP_S3_BUCKET/
fi

# Cleanup
rm -rf "$BACKUP_DIR"
echo "Backup complete: $BACKUP_FILE"
