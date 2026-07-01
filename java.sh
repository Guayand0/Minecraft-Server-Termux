#!/usr/bin/env bash
set -euo pipefail

if ! command -v apt >/dev/null 2>&1; then
  echo "Error: este script debe ejecutarse dentro de Debian."
  exit 1
fi

apt update -y
apt install -y openjdk-25-jdk

java -version
