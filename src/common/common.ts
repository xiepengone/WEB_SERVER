import { zlog } from "../lib/log";
const https = require('https');
const CryptoJS = require("crypto-js");

var request = require("request");

// let console = zlog.getInstance();

export class Common {
    public static toNumber(val: any, def = 0) {
        if (val == null)
            return def;
        let num = Number(val);
        if (num == null || isNaN(num))
            num = def;
        return num;
    }

    private static _exePath: string = __dirname;
    public static setExePath(val: string) {
        this._exePath = val;
    }
    public static get exePath(): string {
        return this._exePath;
    }

    public static getMD5(data) {
        var Buffer = require("buffer").Buffer;
        var buf = new Buffer.from(data);
        var str = buf.toString("binary");
        var crypto = require("crypto");
        let ret: string = crypto.createHash("md5WithRSAEncryption").update(str).digest("hex");

        return ret.toLowerCase();
    }

    private static async _http(url, requestData, method) {
        let query = (resolve, reject) => {
            request({
                url: url,
                method: method,//"POST",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                body: requestData,
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.info("Client res:", null, body);
                    resolve({ error: null, result: body });
                }
                else {
                    console.info("Client res error");
                    if (error != null)
                        console.info("Client res error-->:", null, error);
                    // if (response)
                    //     console.info("Client res response:", null, response);
                    if (response && response.statusCode) {
                        console.info("Client res response.statusCode:", response.statusCode);
                    }
                    // if (response) {
                    //     console.info("Client res response:", response);
                    // }
                    resolve({ error: error, result: null });
                }
            });
        }

        return new Promise(query);
    }

    private static async _httpXMLHttpRequest(url, requestData, method) {
        let query = (resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                    var response = xhr.responseText;
                    // resolve(response);
                    resolve({ error: null, result: response });
                }
            };
            xhr.onerror = function (this: XMLHttpRequest, ev: ProgressEvent) {
                console.log("httpPost ret onerror", ev);
                // resolve(null);
                resolve({ error: ev, result: null });
            }
            xhr.ontimeout = function (this: XMLHttpRequest, ev: ProgressEvent) {
                console.log("httpPost ret ontimeout");
                // resolve(null);
                resolve({ error: ev, result: null });
            }
            xhr.onloadend = function (this: XMLHttpRequest, ev: ProgressEvent) {
                // console.log("httpPost ret onloadend");
                // resolve(null);
                resolve({ error: ev, result: null });
            }
            xhr.open(method, url, true);//"POST"
            //设置发送数据的请求格式
            // xhr.setRequestHeader('content-type', 'application/json');
            // xhr.setRequestHeader("Content-Type", "application/json");
            // xhr.setRequestHeader("Content-Type", "text/plain");
            // xhr.setRequestHeader("Content-Type","application/json;charset=UTF-8"); 
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
            if (requestData != null) {
                if (typeof requestData == "string") {
                    xhr.send(requestData);
                }
                else {
                    try {
                        // let str = JSON.stringify(param);
                        // let str = JSON.stringify({"key": "value"});
                        // let str = "key=value";
                        let str = "{\"key\":\"value\"}";
                        console.log("_http httpPost str", str);
                        xhr.send(str);
                        console.log("_http httpPost end ++++++++++++++++++++++++++++++++++++++++");
                    } catch (error) {
                        console.log("error httpPost ret error", error);
                        return null;
                    }
                }
            }
        }
        return new Promise(query);
    }

    public static async httpPost(url, requestData) {
        return await Common._http(url, requestData, "POST");
    }
    public static async httpPostXMLHttpRequest(url, requestData) {
        return await Common._httpXMLHttpRequest(url, requestData, "POST");
    }

    public static async httpGet(url) {
        let query = (resolve, reject) => {
            https.get(url, (res) => {
                res.on('data', (d) => {
                    let jsstr = JSON.stringify(d);
                    let jsondata = JSON.parse(jsstr);
                    let buf = Buffer.from(jsondata);
                    let data = buf.toString();
                    let obj = JSON.parse(data);

                    resolve({ error: null, result: obj });
                });

            }).on('error', (e) => {
                console.error('ERROR:', e);
                resolve({ error: e, result: null });
            });
        };

        return new Promise(query);
    }

    /**
     * 当前时间字符串 例如 2018-03-20 12:05:25
     */
    public static get now() {
        return Common.getTimeStr(Date.now());
    }

    public static getTimeStr(timestamp: number) {
        timestamp = Math.floor(timestamp);
        if (timestamp.toString().length == 10) {
            timestamp *= 1000;
        }

        let ret = Common.formatDate(new Date(timestamp), 'yyyy-MM-dd hh:mm:ss');
        // console.info("getTimeStr ret:", null, ret);
        return ret;
    }

    /**
     * 将一个时间字符串解析为时间戳(秒)
     * @param timeStr 时间字符串 2018-03-20 12:05:25
     */
    public static getTimestamp(timeStr: string) {
        if (timeStr == null) {
            return 0;
        }
        let time = Date.parse(timeStr) / 1000;
        let tz = 0;// new Date().getTimezoneOffset() * -1;
        return Math.floor(time + tz * 60);
    }

    /**
     * 获取当前UTC时间戳
     */
    public static get nowTime() {
        let now = Date.now() / 1000;

        return Math.floor(now);
    }

    /**
     * 将一个日期格式化为指定的格式
     * @param date 日期
     * @param fmt yyyy:年份 MM:月份 dd:日期 hh:时 mm:分 ss:秒 S:毫秒
     */
    public static formatDate(date: Date, fmt: string) {
        let o = {
            "M+": date.getUTCMonth() + 1,                 //月份 
            "d+": date.getUTCDate(),                    //日 
            "h+": date.getUTCHours(),                   //小时 
            "m+": date.getUTCMinutes(),                 //分 
            "s+": date.getUTCSeconds(),                 //秒 
            "q+": Math.floor((date.getUTCMonth() + 3) / 3), //季度 
            "S": date.getUTCMilliseconds()             //毫秒 
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getUTCFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (let k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    }

    public static getCryptoKey() {
        let key = "0c941b1d0ee26e8deec";// CryptoJS.enc.Utf8.parse('123456789'); //密钥必须是16位，且避免使用保留字符
        return key;
    }

    public static crypto(str) {
        let key = Common.getCryptoKey();
        let encryptedData = CryptoJS.AES.encrypt(str, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        let hexData = encryptedData.ciphertext.toString();
        return hexData;
    }

    public static decrypt(str) {
        let key = Common.getCryptoKey();
        let encryptedHexStr = CryptoJS.enc.Hex.parse(str);
        let encryptedBase64Str = CryptoJS.enc.Base64.stringify(encryptedHexStr);
        let decryptedData = CryptoJS.AES.decrypt(encryptedBase64Str, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        let text = decryptedData.toString(CryptoJS.enc.Utf8);
        return text;
    }

    public static base64Decode(str: string) {
        let b = Buffer.from(str, `base64`);
        return b.toString();

    }
    public static base64Encode(str: string) {
        let b = Buffer.from(str);
        return b.toString(`base64`);
    }
    public static addZero(num: any) {
        return num < 10 ? '0' + num : num;
    }
    public static mysqlTime2NomalTime(date: string) {
        //"2021-04-26T21:39:12.000Z"" => ""2021-04-27 05:39:12"
        do {
            try {
                if (date == null) {
                    break;
                }

                const time = new Date(Date.parse(date));
                const Y = time.getFullYear() + '-';
                const M = Common.addZero(time.getMonth() + 1) + '-';
                const D = Common.addZero(time.getDate()) + ' ';
                const h = Common.addZero(time.getHours()) + ':';
                const m = Common.addZero(time.getMinutes()) + ':';
                const s = this.addZero(time.getSeconds());
                let ret = Y + M + D + h + m + s;
                return ret;
            } catch (error) {
                break;
            }
        } while (false);
        return date;
    }
}
