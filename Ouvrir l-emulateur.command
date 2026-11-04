#!/bin/bash
set -eu
ROOT="$(cd "$(dirname "$0")" && pwd)"
LOCAL_NODE="$ROOT/.tools/node-v22.23.4-darwin-arm64/bin"
if [ -x "$LOCAL_NODE/node" ]; then
  export PATH="$LOCAL_NODE:$PATH"
fi
if ! command -v node >/dev/null 2>&1 || ! command -v python3 >/dev/null 2>&1; then
  echo "Node.js et Python 3 sont requis pour lancer l'emulateur."
  exit 1
fi
cd "$ROOT"
if curl -fsS --max-time 1 http://127.0.0.1:8077/ >/dev/null 2>&1; then
  echo "Un service utilise deja le port 8077. Ouverture de cette adresse."
  /usr/bin/open http://127.0.0.1:8077/
  exit 0
fi
node kit/tools/emu.js benspa_vitals &
emu_pid=$!
trap 'kill "$emu_pid" 2>/dev/null || true' EXIT
for attempt in 1 2 3 4 5 6 7 8 9 10; do
  if curl -fsS --max-time 1 http://127.0.0.1:8077/ >/dev/null 2>&1; then
    /usr/bin/open http://127.0.0.1:8077/
    break
  fi
  sleep 1
done
echo "Emulateur actif. Fermez cette fenetre pour l'arreter."
wait "$emu_pid"
