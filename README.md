# Minecraft-Server-Termux

> Como instalar un servidor de Minecraft en Termux

---

## 🚀 Instalación

- Ejecuta los siguientes comandos de uno en uno en tu terminal Termux:

```bash
pkg update -y && pkg install git -y
git clone https://github.com/Guayand0/Minecraft-Server-Termux
cd Minecraft-Server-Termux && bash install.sh
```

- Ejecuta los siguientes comandos de uno en uno en tu terminal Debian:

```bash
apt update -y && apt install -y openjdk-25-jdk
mkdir mc-server && cd mc-server
```

- Entra en esta [Página Web](https://www.guayando.dev/minecraft-server-termux/), selecciona el servidor y la versión que quieras instalar, copia el comando y ejecutalo en tu terminal Debian.

<div style="padding:10px; border-left:5px solid #2ea043; background:#0d1117;">
💡 <b>TIP</b><br>
Si quieres descargar una versión que no aparece en la página web puedes usar este comando reemplazando <code>$MC_URL</code> con la URL de descarga del archivo de servidor:

```bash
curl -fL -o server.jar $MC_URL
```
</div>


## 📜 Licencia

> **ES:** Este repositorio es código libre, puedes usarlo sin ningún problema.
>
> **EN:** This repository is free code, you can use it without any problem.