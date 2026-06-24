#!/data/data/com.termux/files/usr/bin/bash

set -e

apt update -y
apt upgrade -y
apt install -y openjdk-25-jdk

# URL del server.jar (argumento 1)
MC_URL="$1"

if [ -z "$MC_URL" ]; then
  echo "Uso: $0 <URL_server.jar>"
  echo "Ejemplos:"
  echo "$0 https://piston-data.mojang.com/v1/objects/823e2250d24b3ddac457a60c92a6a941943fcd6a/server.jar"
  echo "$0 https://fill-data.papermc.io/v1/objects/ebbce8dcd115170c234af6d132771282ad89b7df410f03ada503d8c32c8fd5ad/paper-26.2-34.jar"
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

# Crear README
cat << 'EOF' > README.txt
Para iniciar el servidor de MC usa "./1_start.sh"
Para detener el servidor de MC usa "stop"
EOF

# Crear eula
cat << 'EOF' > eula.txt
eula=true
EOF

echo "Instalación completa. Usa './1_start.sh' para inicair el servidor"
