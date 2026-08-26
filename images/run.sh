#!/bin/bash
cd /opt/ha-agent/cardnews-cards/images
nohup python3 generate.py > gen.log 2>&1 &
echo "PID: $!"
echo "Tail log: tail -f /opt/ha-agent/cardnews-cards/images/gen.log"
