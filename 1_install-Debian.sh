#!/data/data/com.termux/files/usr/bin/bash

set -e

yes | pkg update
yes | pkg upgrade
yes | pkg install proot-distro -y

proot-distro install debian

# crear script de accesoa Debian
cat << 'EOF' > 1_debian.sh
#!/data/data/com.termux/files/usr/bin/bash
proot-distro login debian
EOF

chmod +x 1_debian.sh

echo "Debian instalado correctamente."
echo "Usa './1_debian.sh' para entrar a Debian"
echo "Usa 'curl -fsSL https://raw.githubusercontent.com/Guayand0/Minecraft-Server-Termux/main/2_install-MC.sh | bash -s <URL_VERSION>' para terminar la instalacion del servidor de MC"