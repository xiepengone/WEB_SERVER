import * as https from 'https';
import * as http from 'http';
import * as uri from 'url';
import * as AgentKeepAlive from 'agentkeepalive';
import { zlog, logInfo } from "./log";
import { Socket } from 'net';
let console = zlog.getInstance();

export class httpReq {
    private static httpAgent = new AgentKeepAlive({
        // maxSockets: 100,
        maxFreeSockets: 100,
        timeout: 10000,
        //freeSocketKeepAliveTimeout: 60000*20, // free socket keepalive for 30 seconds
        freeSocketTimeout: 60000 * 20  //agentkeepalive deprecated options.freeSocketKeepAliveTimeout is deprecated, please use options.freeSocketTimeout instead
    });

    private static httpsAgent = new AgentKeepAlive.HttpsAgent({
        // maxSockets: 100,
        maxFreeSockets: 100,
        timeout: 10000,
        //freeSocketKeepAliveTimeout: 60000*20, // free socket keepalive for 30 seconds
        freeSocketTimeout: 60000 * 20  //agentkeepalive deprecated options.freeSocketKeepAliveTimeout is deprecated, please use options.freeSocketTimeout instead
    });

    // private static timer = setInterval(()=>{
    //     let httpStatus = httpReq.httpAgent.getCurrentStatus();
    //     let httpsStatus = httpReq.httpsAgent.getCurrentStatus();
    //     console.info(`agent : http=${JSON.stringify(httpStatus)} https=${JSON.stringify(httpsStatus)}`);
    // },2000)

    private static post(i: logInfo, host: string, port: number, path: string, contentType: string, data: string | Buffer, SSL = false): Promise<Buffer> {
        // console.debug("host-------------------------->");
        // console.debug("host:" + host + "port:" + port + ",path:" + path);
        let agent: http.Agent = null
        if (SSL) {
            agent = httpReq.httpsAgent;
        } else {
            agent = httpReq.httpAgent;
        }

        let options: https.RequestOptions = {
            host: host,
            port: port,
            path: path,
            method: 'POST',
            rejectUnauthorized: false,
            timeout: 4000,// 2000,
            headers: {},
            agent: agent
        }
        if (data) {
            options.headers['Content-Type'] = contentType;
            options.headers['Content-Length'] = data.length;
            options.headers['Connection'] = 'keep-alive';
        } else {
            options.headers['Content-Type'] = 'text/plain';
            options.headers['Content-Length'] = 0;
            options.headers['Connection'] = 'keep-alive';
        }

        let retry = 0;
        let promise = (resolve, reject) => {
            try {
                let onResponce = (res: http.IncomingMessage) => {
                    res.on('data', (data) => {
                        if (data) {
                            // console.debug(`http recv ${path} : `, i, data.length);   //一段html代码
                        }

                        resolve(data);
                    });
                }
                let req: http.ClientRequest = null;
                if (SSL) {
                    req = https.request(options, onResponce.bind(this));
                } else {
                    req = http.request(options, onResponce.bind(this));
                }
                req.on('error', (e) => {
                    retry++;
                    console.debug(`[${retry}]problem with request: ` + e.message, i);

                    if (retry < 3) {
                        promise(resolve, reject);
                    } else {
                        reject(e);
                    }
                });
                req.on('socket', (s: Socket) => {
                    s.setTimeout(10000, () => {
                        console.error(`socket timeout : ${host}:${port}${path}`, i);
                        s.destroy();
                    })
                });

                if (data) {
                    req.write(data);
                }
                req.end();
            } catch (e) {
                console.error(`http post error : ${e.message}`, i);
                reject(e);
            }
        }

        return new Promise(promise);
    }

    public static postFormed(i: logInfo, url: string, post: string) {
        let u = new uri.URL(url);

        return httpReq.post(i, u.hostname, Number.parseInt(u.port), u.pathname, 'application/x-www-form-urlencoded', post, (u.protocol == 'https:'));
    }

    public static postByte(i: logInfo, url: string, post: Buffer) {
        let u = new uri.URL(url);

        return httpReq.post(i, u.hostname, Number.parseInt(u.port), u.pathname, 'application/binary', post, (u.protocol == 'https:'));
    }

    public static postText(i: logInfo, url: string, post: string) {
        // console.debug(`post url : ${url}`);
        let u = new uri.URL(url);
        // console.debug(`post text : ${post}`);
        return httpReq.post(i, u.hostname, Number.parseInt(u.port), u.pathname, 'text/plain', post, (u.protocol == 'https:'));

    }
    public static postJson(i: logInfo, url: string, post: string) {
        let u = new uri.URL(url);

        return httpReq.post(i, u.hostname, Number.parseInt(u.port), u.pathname, 'application/json', post, (u.protocol == 'https:'));
    }
}