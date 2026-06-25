#!/data/data/com.termux/files/usr/bin/bash

set -e

apt update -y
apt upgrade -y
apt install -y openjdk-25-jdk

# URL del server.jar (argumento 1)
MC_URL="$1"

if [ -z "$MC_URL" ]; then
  echo "Uso: $0 <URL_server.jar>"
  echo "Ejemplo:"
  echo "$0 https://api.leafmc.one/v2/projects/leaf/versions/1.21.11/builds/168/downloads/leaf-1.21.11-168.jar"
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
