#!/data/data/com.termux/files/usr/bin/bash

set -e

apt update -y
apt upgrade -y
apt install -y openjdk-25-jdk

# URL del server.jar (argumento 1)
MC_URL="$1"

if [ -z "$MC_URL" ]; then
  echo "Uso: $0 -s <URL_server.jar>"
  echo "Ejemplo:"
  echo "$0 -s https://api.purpurmc.org/v2/purpur/26.2/2603/download"
  exit 1
fi

echo "Descargando server.jar desde:"
echo "$MC_URL"

curl -L -o server.jar "$MC_URL"

# Crear 1_start.sh
cat << 'EOF' > 1_start.sh
java -Xmx1024M -jar server.jar nogui
EOF

chmod +x 1_start.sh

# Crear eula
cat << 'EOF' > eula.txt
eula=true
EOF

echo "Instalación completa. Usa './1_start.sh' para inicair el servidor"
