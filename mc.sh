#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$HOME/mc-server"

bash "$SCRIPT_DIR/java.sh"

mkdir -p "$SERVER_DIR"

install -m 755 "$SCRIPT_DIR/start.sh" "$SERVER_DIR/start.sh"
install -m 644 "$SCRIPT_DIR/eula.txt" "$SERVER_DIR/eula.txt"

echo "Carpeta del servidor lista en: $SERVER_DIR"
echo "Ahora descarga server.jar dentro de esa carpeta y luego ejecuta: bash start.sh"
