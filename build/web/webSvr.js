"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSvr = void 0;
const express = require("express");
const exStatic = require("express-static");
const app = express();
var path = require('path');
var fs = require('fs');
class WebSvr {
    constructor() { }
    static get instance() {
        if (WebSvr._instance == null) {
            WebSvr._instance = new WebSvr();
        }
        return WebSvr._instance;
    }
    init(szRootPath, nPort) {
        // app.use(express.static('public'))
        var list = ['/*.html',
            '/*.jpg',
            '/*.png',
            '/*.txt',
            '/*.json',
            '/*.bundle',
            '/*.xml',
        ];
        app.get(list, function (req, res) {
            WebSvr.instance._setRes(res);
            // let url = path.join( __dirname , "../webfile" , req.path );
            let url = path.join(__dirname, szRootPath, req.path);
            console.log("url:", url);
            var content = fs.readFileSync(url, "binary");
            let szType = WebSvr.instance._getFileType(req.path);
            res.setHeader("Content-Type", szType);
            res.writeHead(200, "Ok");
            res.write(content, "binary"); //格式必须为 binary，否则会出错
            res.end();
        });
        app.get('/', (req, res) => {
            // let url = path.join( __dirname , "../webfile/" , "index.html" );
            let url = path.join(__dirname, szRootPath, "index.html");
            console.log("url 2:", url);
            res.sendFile(url); //设置/ 下访问文件位置
        });
        // app.listen(8989);
        app.listen(nPort);
    }
    _setRes(res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.setHeader('Cache-Control', 'no-cache');
    }
    _getFileType(path) {
        let ret = "";
        let list = [
            [".js", "application/x-javascript"],
            [".jpe", "image/jpeg"],
            [".jpeg", "image/jpeg"],
            [".jpg", "image/jpeg"],
            [".css", "text/css"],
            [".png", "image/png"],
            [".woff", "font/x-font-woff"],
            [".html", "text/html"],
            [".json", "application/json"],
            [".bundle", "application/bundle"],
            [".xml", "text/xml"],
        ];
        for (let v of list) {
            if (path.indexOf(v[0]) >= 0) {
                ret = v[1];
                break;
            }
        }
        return ret;
    }
}
exports.WebSvr = WebSvr;
WebSvr._instance = null;
//# sourceMappingURL=webSvr.js.map