import os
import sys
#svn co https://26.ageof.net:44343/svn/SLG_RTS/trunk/GM_MAFIA  /home/webGMMafia
os.chdir(os.path.split(os.path.realpath(__file__))[0])
#svn up
print("webGMMafia svn up ...")
os.system("svn up")
#nodejs,npm install
print("webGMMafia npm install ...")
os.system("npm install")
#ts to js
print("webGMMafia tsc ...")
os.system("tsc")
#run js
print("webGMMafia ApplicationMain ...")
#os.system("supervisor -i ./web ./build/ApplicationMain.js")
#pm2 start test.json
os.system("pm2 start pm2.json")
