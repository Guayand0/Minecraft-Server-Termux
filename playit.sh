#!/bin/bash

apt update -y && apt install -y git wget

mkdir ~/playit && cd ~/playit

wget https://github.com/playit-cloud/playit-agent/releases/download/v1.0.10/playit-linux-aarch64
chmod +x playit-linux-aarch64

wget https://github.com/playit-cloud/playit-agent/releases/download/v1.0.10/playit-cli-linux-aarch64
chmod +x playit-cli-linux-aarch64