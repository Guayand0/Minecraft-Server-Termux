# Minecraft-Server-Termux

> Como instalar un servidor de Minecraft en Termux

---

## 🚀 Instalación

- Ejecuta los siguientes comandos en tu terminal Termux:

```bash
pkg update -y
pkg install git -y
git clone https://github.com/Guayand0/Minecraft-Server-Termux
cd Minecraft-Server-Termux
bash install.sh
```

- Ejecuta los siguientes comandos en tu terminal Debian:

```bash
apt install -y openjdk-25-jdk
mkdir mc-server
cd mc-server
```

- Entra en esta [Página Web](https://www.guayando.dev/minecraft-server-termux/) para seleccionar la version del servidor de Minecraft que quieras instalar.
- Ejecuta el siguiente comando reemplazando `$MC_URL` con la URL que copiaste en la pagina web:

```bash
curl -fL -o server.jar "$MC_URL"

```

---
---
---
---
---







1. Abre Termux e instala Debian con este comando:
```bash
curl -fsSL https://raw.githubusercontent.com/Guayand0/Minecraft-Server-Termux/main/1_install-Debian.sh | bash
```

2. Despues de instalar Debian, ejecuta `./1_debian.sh` para iniciarlo y luego usa esto para descargar la version que quieras:
```bash
curl -fsSL https://raw.githubusercontent.com/Guayand0/Minecraft-Server-Termux/main/2_install-MC.sh | bash -s "<URL_VERSION>"
```

3. Para iniciar el servidor de Minecraft usa `./1_start.sh`















---
---
---
---
---
---
---
---
---
---
---
---
---
---
---
---

```bash
pkg update -y
pkg install proot-distro -y
sleep 2
proot-distro install debian
cat << 'EOF' > debian.sh
proot-distro login debian
EOF
bash debian.sh
```

---
---
---
---
---
---
---
---
---
---
---
---
---
---
---
---




# termux-ngrok

> Run the official ngrok binary in Termux.

---

## 📋 Table of Contents

- [Install](#-install)
- [Usage](#-usage)
- [Uninstall](#️-uninstall)
- [License](#-license)

---

## 🚀 Install

Run the following commands in your Termux terminal:

```bash
pkg update -y
pkg install git -y
git clone https://github.com/Yisus7u7/termux-ngrok
cd termux-ngrok
bash install.sh
```

---

## ▶️ Usage

Once installed, start ngrok by simply typing:

```bash
ngrok
```

---

## 🗑️ Uninstall

Navigate back to the cloned folder and run the uninstall script:

```bash
cd termux-ngrok
bash uninstall.sh
```

### Advanced Option

To uninstall and automatically clean the package cache without being prompted:

```bash
bash uninstall.sh --prune
```

---

## 📜 License

> **ES:** Este repositorio es código libre, puedes usarlo sin ningún problema.
>
> **EN:** This repository is free code, you can use it without any problem.