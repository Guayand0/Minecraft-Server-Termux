#!/usr/bin/env bash
set -euo pipefail

is_usable_ipv4() {
    local address="$1"
    [[ "$address" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]] || return 1
    [[ "$address" != 127.* && "$address" != 169.254.* ]]
}

device_ip=""

# Use the source address selected by the active IPv4 route when available.
if command -v ip >/dev/null 2>&1; then
    device_ip="$(ip -4 route get 1.1.1.1 2>/dev/null | awk '{for (i = 1; i <= NF; i++) if ($i == "src") {print $(i + 1); exit}}' || true)"
fi

# Fall back to an assigned IPv4 address if route lookup is unavailable.
if ! is_usable_ipv4 "$device_ip" && command -v hostname >/dev/null 2>&1; then
    for address in $(hostname -I 2>/dev/null || true); do
        if is_usable_ipv4 "$address"; then
            device_ip="$address"
            break
        fi
    done
fi

if is_usable_ipv4 "$device_ip"; then
    printf '%s\n' "$device_ip"
    exit 0
fi

echo "No se pudo detectar una IPv4 local. Comprueba que el dispositivo esté conectado a una red." >&2
exit 1
