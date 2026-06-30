#!/bin/bash

pkg install proot-distro -y

sleep 3

proot-distro install debian

echo -e "\e[1;32mDebian installed successfully!\e[0m"
bash debian.sh