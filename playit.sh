#!/usr/bin/env bash
set -euo pipefail

PLAYIT_DIR="$HOME/playit"
PLAYIT_VERSION="v1.0.10"
BASE_URL="https://github.com/playit-cloud/playit-agent/releases/download/$PLAYIT_VERSION"

if ! command -v apt >/dev/null 2>&1; then
  echo "Error: este script debe ejecutarse dentro de Debian."
  exit 1
fi

case "$(uname -m)" in
  aarch64|arm64)
    PLAYIT_ARCH="aarch64"
    ;;
  x86_64|amd64)
    PLAYIT_ARCH="amd64"
    ;;
  armv7l|armv7*)
    PLAYIT_ARCH="armv7"
    ;;
  i386|i686)
    PLAYIT_ARCH="i686"
    ;;
  *)
    echo "Error: arquitectura no soportada por este script."
    echo "Arquitecturas soportadas: aarch64, amd64, armv7, i686"
    echo "Tu sistema devolvio: $(uname -m)"
    exit 1
    ;;
esac

apt update -y
apt install -y wget

mkdir -p "$PLAYIT_DIR"
cd "$PLAYIT_DIR"

download() {
  local file="$1"
  echo "Descargando $file..."
  wget -q --show-progress -O "${file}.tmp" "$BASE_URL/$file"
  mv "${file}.tmp" "$file"
  chmod +x "$file"
}

AGENT_BIN="playit-linux-${PLAYIT_ARCH}"
CLI_BIN="playit-cli-linux-${PLAYIT_ARCH}"

download "$AGENT_BIN"
download "$CLI_BIN"

cat <<EOF
Playit listo en: $PLAYIT_DIR
Arquitectura detectada: $PLAYIT_ARCH

Siguientes pasos:
1. En una terminal, ejecuta el agente:
   bash debian.sh
   cd ~/playit
   ./$AGENT_BIN --socket-path=./playit.sock --secret-path=./playit.toml

2. En otra terminal, ejecuta el cliente:
   bash debian.sh
   cd ~/playit
   ./$CLI_BIN --socket-path=./playit.sock

3. Cuando playit te muestre el enlace, inicia sesion, crea el agente y el tunel.
EOF
