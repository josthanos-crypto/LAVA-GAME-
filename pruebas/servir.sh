#!/bin/sh
# compila el juego y lo sirve en http://localhost:8765/sub/index.html (lo que abren las pruebas)
cd "$(dirname "$0")/.." || exit 1
[ -d node_modules ] || npm install
npx vite build --base ./ || exit 1
mkdir -p srv
ln -sfn ../dist srv/sub
cd srv && exec python3 -m http.server 8765
