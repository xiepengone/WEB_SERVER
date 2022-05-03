#!/bin/bash
echo "webGMMafia svn up ..."
svn up
#nodejs,npm install
echo "webGMMafia npm install ..."
npm install
#ts to js
echo "webGMMafia tsc ..."
tsc
#run js
echo "webGMMafia ApplicationMain ..."
#os.system("supervisor -i ./web ./build/ApplicationMain.js")
#pm2 start test.json
pm2 start pm2.json


