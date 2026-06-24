#!/data/data/com.termux/files/usr/bin/bash

yes | pkg update
yes | pkg upgrade
yes | pkg install proot-distro -y

proot-distro install debian

# crear script de acceso
cat << 'EOF' > 1_debian.sh
#!/data/data/com.termux/files/usr/bin/bash
proot-distro login debian
EOF

chmod +x 1_debian.sh

# Crear README
cat << 'EOF' > README.txt
Para iniciar debian usa "./1_debian.sh", una vez dentro usa "./1_start.sh" para iniciar el servidor
EOF

echo "Instalación completa. Entrando en debian con ./1_debian.sh"
echo "usa 'curl -fsSL https://raw.githubusercontent.com/Guayand0/Minecraft-Server-Termux/main/2_install-MC.sh | bash' para terminar la instalacion de MC"

./1_debian.sh
