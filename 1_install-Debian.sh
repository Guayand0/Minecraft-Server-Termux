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

echo "Instalación completa. Usa ./1_debian.sh para entrar a Debian"