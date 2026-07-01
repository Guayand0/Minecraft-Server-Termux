# Minecraft-Server-Termux

Guia para instalar y arrancar un servidor de Minecraft en Termux usando Debian.

## Resumen rapido

1. Instala Debian en Termux con `install.sh`.
2. Dentro de Debian, instala Java y prepara la carpeta del servidor con `mc.sh`.
3. Descarga `server.jar` dentro de `~/mc-server`.
4. Arranca el servidor con `bash start.sh`.
5. Opcional: instala y usa `playit.gg` para acceso desde fuera de tu red.

## 1. Instalar Debian en Termux

Abre Termux y ejecuta:

```bash
pkg update -y && pkg install git -y
git clone https://github.com/Guayand0/Minecraft-Server-Termux
cd ~/Minecraft-Server-Termux
bash install.sh
```

Este script instala `proot-distro`, prepara Debian y te deja dentro de la distro.

## 2. Instalar Java y preparar el servidor

Ya dentro de Debian, ejecuta:

```bash
apt update -y && apt install -y git wget
git clone https://github.com/Guayand0/Minecraft-Server-Termux
cd ~/Minecraft-Server-Termux
bash mc.sh
cd ~/mc-server
```

`mc.sh` instala Java si hace falta, crea `~/mc-server` y copia los scripts base del servidor.

## 3. Descargar el archivo del servidor

Dentro de `~/mc-server`, descarga `server.jar`.

Entra en esta [Página Web](https://www.guayando.dev/minecraft-server-termux/), selecciona el servidor y la versión que quieras instalar, copia el comando y ejecutalo en tu terminal Debian.

Si quieres descargar una versión que no aparece en la página web puedes usar este comando reemplazando <code>$MC_URL</code> con la URL de descarga del archivo de servidor:

```bash
curl -fL -o server.jar $MC_URL
```

## 4. Iniciar el servidor

Cuando `server.jar` ya exista en `~/mc-server`, arranca el servidor con:

```bash
bash start.sh
```

Puedes cambiar la RAM sin editar el script:

```bash
RAM=3072 bash start.sh
```

## 5. Opcional: instalar playit.gg

Si quieres que otros entren desde fuera de tu red, instala los binarios de `playit.gg`:

```bash
cd ~/Minecraft-Server-Termux
bash playit.sh
```

`playit.sh` detecta tu arquitectura automaticamente y baja estos binarios:

- `aarch64` o `arm64`
- `amd64` o `x86_64`
- `armv7` o `armv7l`
- `i686` o `i386`

## 6. Terminales necesarias

Para jugar con acceso externo vas a usar 3 terminales:

1. Terminal del servidor de Minecraft: `bash start.sh`
2. Terminal del agente de playit.gg
3. Terminal del cliente de playit.gg

## 7. Ejecutar playit.gg

Abre una terminal nueva para cada proceso.

### Terminal del agente

```bash
bash debian.sh
cd ~/playit
./playit-linux-$ARQUITECTURA --socket-path=./playit.sock --secret-path=./playit.toml
```

### Terminal del cliente

```bash
bash debian.sh
cd ~/playit
./playit-cli-linux-$ARQUITECTURA --socket-path=./playit.sock
```

`playit.sh` te dira exactamente que binarios se descargaron segun tu arquitectura. Cuando el cliente te muestre el enlace para iniciar sesion, abrelo en el navegador, crea el agente y luego crea el tunel. Al terminar, playit.gg te dara una direccion fija para conectar siempre al mismo servidor.

## Orden recomendado de uso

1. Termux: `bash install.sh`
2. Debian: `bash mc.sh`
3. Debian: descargar `server.jar`
4. Debian: `bash start.sh`
5. Opcional: `bash playit.sh`
6. Opcional: abrir las dos terminales de `playit.gg`

## Notas utiles

- `debian.sh` solo sirve para entrar a Debian desde Termux.
- `start.sh` comprueba que exista `server.jar` antes de arrancar.
- Si quieres subir o cambiar la RAM, usa la variable `RAM`.
- `playit.sh` descarga el binario correcto segun la arquitectura detectada.

## Licencia

Este repositorio es codigo libre y puedes usarlo sin problema.
