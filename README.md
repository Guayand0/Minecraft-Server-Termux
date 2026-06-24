# Minecraft-Server-Termux
> Como instalar un servidor de Minecraft en Termux

1. Abrir termux e instalar Debian con este comando:
``` bash
curl -fsSL https://raw.githubusercontent.com/Guayand0/Minecraft-Server-Termux/main/1_install-Debian.sh | bash
```

2. Después de instalar Debian, hay que usar "./1_debian.sh" para iniciarlo y después usar esto:
``` bash
curl -fsSL https://raw.githubusercontent.com/Guayand0/Minecraft-Server-Termux/main/2_install-MC.sh | bash -s "https://piston-data.mojang.com/v1/objects/823e2250d24b3ddac457a60c92a6a941943fcd6a/server.jar"
```

3. Para iniciar el servidor de MC usa "./1_start.sh"