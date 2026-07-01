#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v pkg >/dev/null 2>&1; then
  echo "Error: este script debe ejecutarse en Termux."
  exit 1
fi

if ! command -v proot-distro >/dev/null 2>&1; then
  echo "Instalando proot-distro..."
  pkg update -y
  pkg install -y proot-distro
fi

echo "Preparando Debian..."
proot-distro install debian

install -m 755 "$SCRIPT_DIR/debian.sh" "$HOME/debian.sh"

echo "Debian listo. Para entrar mas tarde, usa: bash ~/debian.sh"
echo "Abriendo Debian ahora..."
bash "$HOME/debian.sh"
