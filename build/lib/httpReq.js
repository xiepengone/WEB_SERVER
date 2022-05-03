"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpReq = void 0;
const https = require("https");
const http = require("http");
const uri = require("url");
const AgentKeepAlive = require("agentkeepalive");
const log_1 = require("./log");
let console = log_1.zlog.getInstance();
class httpReq {
    // private static timer = setInterval(()=>{
    //     let httpStatus = httpReq.httpAgent.getCurrentStatus();
    //     let httpsStatus = httpReq.httpsAgent.getCurrentStatus();
    //     console.info(`agent : http=${JSON.stringify(httpStatus)} https=${JSON.stringify(httpsStatus)}`);
    // },2000)
    static post(i, host, port, path, contentType, data, SSL = false) {
        // console.debug("host-------------------------->");
        // console.debug("host:" + host + "port:" + port + ",path:" + path);
        let agent = null;
        if (SSL) {
            agent = httpReq.httpsAgent;
        }
        else {
            agent = httpReq.httpAgent;
        }
        let options = {
            host: host,
            port: port,
            path: path,
            method: 'POST',
            rejectUnauthorized: false,
            timeout: 4000,
            headers: {},
            agent: agent
        };
        if (data) {
            options.headers['Content-Type'] = contentType;
            options.headers['Content-Length'] = data.length;
            options.headers['Connection'] = 'keep-alive';
        }
        else {
            options.headers['Content-Type'] = 'text/plain';
            options.headers['Content-Length'] = 0;
            options.headers['Connection'] = 'keep-alive';
        }
        let retry = 0;
        let promise = (resolve, reject) => {
            try {
                let onResponce = (res) => {
                    res.on('data', (data) => {
                        if (data) {
                            // console.debug(`http recv ${path} : `, i, data.length);   //一段html代码
                        }
                        resolve(data);
                    });
                };
                let req = null;
                if (SSL) {
                    req = https.request(options, onResponce.bind(this));
                }
                else {
                    req = http.request(options, onResponce.bind(this));
                }
                req.on('error', (e) => {
                    retry++;
                    console.debug(`[${retry}]problem with request: ` + e.message, i);
                    if (retry < 3) {
                        promise(resolve, reject);
                    }
                    else {
                        reject(e);
                    }
                });
                req.on('socket', (s) => {
                    s.setTimeout(10000, () => {
                        console.error(`socket timeout : ${host}:${port}${path}`, i);
                        s.destroy();
                    });
                });
                if (data) {
                    req.write(data);
                }
                req.end();
            }
            catch (e) {
                console.error(`http post error : ${e.message}`, i);
                reject(e);
            }
        };
        return new Promise(promise);
    }
    static postFormed(i, url, post) {
        let u = new uri.URL(url);
        return httpReq.post(i, u.hostname, Number.parseInt(u.port), u.pathname, 'application/x-www-form-urlencoded', post, (u.protocol == 'https:'));
    }
    static postByte(i, url, post) {
        let u = new uri.URL(url);
        return httpReq.post(i, u.hostname, Number.parseInt(u.port), u.pathname, 'application/binary', post, (u.protocol == 'https:'));
    }
    static postText(i, url, post) {
        // console.debug(`post url : ${url}`);
        let u = new uri.URL(url);
        // console.debug(`post text : ${post}`);
        return httpReq.post(i, u.hostname, Number.parseInt(u.port), u.pathname, 'text/plain', post, (u.protocol == 'https:'));
    }
    static postJson(i, url, post) {
        let u = new uri.URL(url);
        return httpReq.post(i, u.hostname, Number.parseInt(u.port), u.pathname, 'application/json', post, (u.protocol == 'https:'));
    }
}
exports.httpReq = httpReq;
httpReq.httpAgent = new AgentKeepAlive({
    // maxSockets: 100,
    maxFreeSockets: 100,
    timeout: 10000,
    //freeSocketKeepAliveTimeout: 60000*20, // free socket keepalive for 30 seconds
    freeSocketTimeout: 60000 * 20 //agentkeepalive deprecated options.freeSocketKeepAliveTimeout is deprecated, please use options.freeSocketTimeout instead
});
httpReq.httpsAgent = new AgentKeepAlive.HttpsAgent({
    // maxSockets: 100,
    maxFreeSockets: 100,
    timeout: 10000,
    //freeSocketKeepAliveTimeout: 60000*20, // free socket keepalive for 30 seconds
    freeSocketTimeout: 60000 * 20 //agentkeepalive deprecated options.freeSocketKeepAliveTimeout is deprecated, please use options.freeSocketTimeout instead
});
//# sourceMappingURL=httpReq.js.map