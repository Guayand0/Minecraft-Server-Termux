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
  echo "$0 https://api.purpurmc.org/v2/purpur/26.2/2603/download"
  exit 1
fi

echo "Descargando server.jar desde:"
echo "$MC_URL"

if ! curl -fL -o server.jar "$MC_URL"; then
  echo "Error: fallo al descargar server.jar"
  exit 1
fi

# Crear start.sh
cat << 'EOF' > start.sh
#!/data/data/com.termux/files/usr/bin/bash

# ===== Configuración =====
JAR_FILE="server.jar"

# RAM (en MB)
MIN_RAM="1024"
MAX_RAM="2048"

# ===== Ejecución =====
java -Xms${MIN_RAM}M -Xmx${MAX_RAM}M -jar "${JAR_FILE}" nogui
EOF

chmod +x start.sh

# Crear eula.txt
cat << 'EOF' > eula.txt
eula=true
EOF

echo "Instalación del servidor completada."
echo "Usa './start.sh' para inicair el servidor."
