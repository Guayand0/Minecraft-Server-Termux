#!/usr/bin/env bash
set -euo pipefail

if ! command -v proot-distro >/dev/null 2>&1; then
  echo "Error: proot-distro no esta instalado en Termux."
  echo "Vuelve a la terminal de Termux y ejecuta: bash ~/Minecraft-Server-Termux/install.sh"
  exit 1
fi

proot-distro login debian
