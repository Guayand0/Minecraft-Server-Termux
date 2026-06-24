#!/data/data/com.termux/files/usr/bin/bash

apt update -y
apt upgrade -y
apt install -y openjdk-25-jdk curl

mkdir -p servidor
cd servidor

curl -L -o server.jar https://piston-data.mojang.com/v1/objects/823e2250d24b3ddac457a60c92a6a941943fcd6a/server.jar
