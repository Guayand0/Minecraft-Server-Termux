# Minecraft-Server-Termux

> Como instalar un servidor de Minecraft en Termux

---

## 🚀 Instalación Debian

- Ejecuta los siguientes comandos de uno en uno en tu terminal Termux:

```bash
pkg update -y && pkg install git -y
git clone https://github.com/Guayand0/Minecraft-Server-Termux
cd Minecraft-Server-Termux && bash install.sh
```

---

## 🚀 Instalación Servidor

- Ejecuta los siguientes comandos de uno en uno en tu terminal Debian:

```bash
apt update -y && apt install git -y
git clone https://github.com/Guayand0/Minecraft-Server-Termux
cd Minecraft-Server-Termux && bash mc.sh
cd ~/mc-server
```

- Entra en esta [Página Web](https://www.guayando.dev/minecraft-server-termux/), selecciona el servidor y la versión que quieras instalar, copia el comando y ejecutalo en tu terminal Debian.

<details style="padding:10px; border-left:5px solid #e3e92c; background:#0d1117;">
<summary style="cursor:pointer;"><strong>💡 Tip</strong>        Click para desplegar</summary>
<div>
Si quieres descargar una versión que no aparece en la página web puedes usar este comando reemplazando <code>$MC_URL</code> con la URL de descarga del archivo de servidor:

```bash
curl -fL -o server.jar $MC_URL
```
</div>
</details>

- Ejecuta el siguiente comando para iniciar el servidor de Minecraft:

```bash
bash start.sh
```

---

## 📜 Licencia

> **ES:** Este repositorio es código libre, puedes usarlo sin ningún problema.