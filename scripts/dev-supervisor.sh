#!/bin/bash
# Persistent supervisor: restarts dev server if it dies
cd /home/z/my-project
while true; do
  echo "[$(date)] Starting next dev..."
  /home/z/my-project/node_modules/.bin/next dev -p 3000 >> /home/z/my-project/dev.log 2>&1
  echo "[$(date)] next dev exited with code $?, restarting in 2s..."
  sleep 2
done
