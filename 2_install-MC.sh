#!/data/data/com.termux/files/usr/bin/bash

apt update -y
apt upgrade -y
apt install -y openjdk-25-jdk

curl -L -o server.jar https://piston-data.mojang.com/v1/objects/823e2250d24b3ddac457a60c92a6a941943fcd6a/server.jar

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
