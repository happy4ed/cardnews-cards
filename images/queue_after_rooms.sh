#!/bin/bash
cd /opt/ha-agent/cardnews-cards/images
# Wait for rooms pipeline to finish
while pgrep -f "python3 generate_rooms.py" > /dev/null; do
  sleep 30
done
echo "$(date '+%Y-%m-%d %H:%M:%S') rooms done, starting extras" >> queue.log
nohup python3 generate_extra.py > gen_extra.log 2>&1
