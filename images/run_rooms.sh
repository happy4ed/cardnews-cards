#!/bin/bash
cd /opt/ha-agent/cardnews-cards/images
nohup python3 generate_rooms.py > gen_rooms.log 2>&1 &
echo "Room pipeline PID: $!"
