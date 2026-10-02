#!/usr/bin/env bash
set -euo pipefail

SERVER_DIR="$HOME/mc-server"
PROPERTIES_FILE="$SERVER_DIR/server.properties"

if [ ! -f "$PROPERTIES_FILE" ]; then
    echo "Error: no se encontro $PROPERTIES_FILE"
    echo "Primero inicia el servidor una vez para que se genere server.properties."
    exit 1
fi

TEMP_FILE="$(mktemp "$SERVER_DIR/.server.properties.XXXXXX")"
trap 'rm -f "$TEMP_FILE"' EXIT

awk '
    BEGIN {
        values["online-mode"] = "false"
        values["white-list"] = "false"
        values["simulation-distance"] = "5"
    }
    {
        line = $0
        for (key in values) {
            pattern = "^[[:space:]]*" key "[[:space:]]*="
            if (line ~ pattern) {
                sub(/=.*/, "=" values[key], line)
                found[key] = 1
            }
        }
        print line
    }
    END {
        for (key in values) {
            if (found[key]) {
                print "Actualizada: " key "=" values[key] > "/dev/stderr"
            } else {
                print "No existe; sin cambios: " key > "/dev/stderr"
            }
        }
    }
' "$PROPERTIES_FILE" > "$TEMP_FILE"

cat "$TEMP_FILE" > "$PROPERTIES_FILE"
echo "Propiedades del servidor actualizadas."
