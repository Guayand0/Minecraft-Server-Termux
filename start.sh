#!/usr/bin/env bash
set -euo pipefail

SERVER_DIR="$HOME/mc-server"
SERVER_JAR="$SERVER_DIR/server.jar"
RAM="${RAM:-2048}"

case "$RAM" in
  ''|*[!0-9]*)
    echo "Error: RAM debe ser un numero entero. Ejemplo: RAM=3072 bash start.sh"
    exit 1
    ;;
esac

if ! command -v java >/dev/null 2>&1; then
  echo "Error: Java no esta instalado."
  echo "Vuelve a Debian y ejecuta: bash ~/Minecraft-Server-Termux/java.sh"
  exit 1
fi

if [ ! -f "$SERVER_JAR" ]; then
  echo "Error: no se encontro $SERVER_JAR"
  echo "Primero descarga el archivo del servidor y guardalo como server.jar"
  echo "Ejemplo:"
  echo "curl -fL -o server.jar https://api.purpurmc.org/v2/purpur/26.2/2603/download"
  exit 1
fi

cd "$SERVER_DIR"

if [ ! -f eula.txt ]; then
  printf 'eula=true\n' > eula.txt
fi

echo "Iniciando servidor con Xms=1024M y Xmx=${RAM}M..."
exec java -Xms1024M -Xmx"${RAM}"M -jar server.jar nogui
