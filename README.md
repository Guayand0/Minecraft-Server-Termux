# Minecraft-Server-Termux
> Como instalar un servidor de Minecraft en Termux

1. Abre Termux e instala Debian con este comando:
```bash
curl -fsSL https://raw.githubusercontent.com/Guayand0/Minecraft-Server-Termux/main/1_install-Debian.sh | bash
```

2. Despues de instalar Debian, ejecuta `./1_debian.sh` para iniciarlo y luego usa esto para descargar la version que quieras:
```bash
curl -fsSL https://raw.githubusercontent.com/Guayand0/Minecraft-Server-Termux/main/2_install-MC.sh | bash -s "<URL_VERSION>"
```

3. Para iniciar el servidor de Minecraft usa `./1_start.sh`

## Web y API

- La web incluye selector de idioma en espanol e ingles.
- La API usa pool de conexiones, manejo de errores y cabeceras de cache para responder mas rapido.
