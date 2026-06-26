#!/data/data/com.termux/files/usr/bin/bash

set -e

yes | pkg update
yes | pkg upgrade
yes | pkg install proot-distro -y

proot-distro install debian

# crear script de acceso a Debian
cat << 'EOF' > debian.sh
#!/data/data/com.termux/files/usr/bin/bash

proot-distro login debian
EOF

chmod +x debian.sh

echo "Debian instalado correctamente."
echo "Usa './debian.sh' para entrar a Debian."