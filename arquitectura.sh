#!/usr/bin/env bash
set -euo pipefail

case "$(uname -m)" in
    aarch64|arm64)
        printf '%s\n' "aarch64"
        ;;
    x86_64|amd64)
        printf '%s\n' "amd64"
        ;;
    armv7l|armv7*)
        printf '%s\n' "armv7"
        ;;
    i386|i686)
        printf '%s\n' "i686"
        ;;
    *)
        echo "Error: arquitectura no soportada: $(uname -m)" >&2
        echo "Arquitecturas compatibles: aarch64, amd64, armv7, i686" >&2
        exit 1
        ;;
esac
