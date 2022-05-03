"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Common = void 0;
const https = require('https');
const CryptoJS = require("crypto-js");
var request = require("request");
// let console = zlog.getInstance();
class Common {
    static toNumber(val, def = 0) {
        if (val == null)
            return def;
        let num = Number(val);
        if (num == null || isNaN(num))
            num = def;
        return num;
    }
    static setExePath(val) {
        this._exePath = val;
    }
    static get exePath() {
        return this._exePath;
    }
    static getMD5(data) {
        var Buffer = require("buffer").Buffer;
        var buf = new Buffer.from(data);
        var str = buf.toString("binary");
        var crypto = require("crypto");
        let ret = crypto.createHash("md5WithRSAEncryption").update(str).digest("hex");
        return ret.toLowerCase();
    }
    static _http(url, requestData, method) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = (resolve, reject) => {
                request({
                    url: url,
                    method: method,
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
            };
            return new Promise(query);
        });
    }
    static _httpXMLHttpRequest(url, requestData, method) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = (resolve, reject) => {
                let xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                        var response = xhr.responseText;
                        // resolve(response);
                        resolve({ error: null, result: response });
                    }
                };
                xhr.onerror = function (ev) {
                    console.log("httpPost ret onerror", ev);
                    // resolve(null);
                    resolve({ error: ev, result: null });
                };
                xhr.ontimeout = function (ev) {
                    console.log("httpPost ret ontimeout");
                    // resolve(null);
                    resolve({ error: ev, result: null });
                };
                xhr.onloadend = function (ev) {
                    // console.log("httpPost ret onloadend");
                    // resolve(null);
                    resolve({ error: ev, result: null });
                };
                xhr.open(method, url, true); //"POST"
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
                        }
                        catch (error) {
                            console.log("error httpPost ret error", error);
                            return null;
                        }
                    }
                }
            };
            return new Promise(query);
        });
    }
    static httpPost(url, requestData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Common._http(url, requestData, "POST");
        });
    }
    static httpPostXMLHttpRequest(url, requestData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Common._httpXMLHttpRequest(url, requestData, "POST");
        });
    }
    static httpGet(url) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    /**
     * 当前时间字符串 例如 2018-03-20 12:05:25
     */
    static get now() {
        return Common.getTimeStr(Date.now());
    }
    static getTimeStr(timestamp) {
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
    static getTimestamp(timeStr) {
        if (timeStr == null) {
            return 0;
        }
        let time = Date.parse(timeStr) / 1000;
        let tz = 0; // new Date().getTimezoneOffset() * -1;
        return Math.floor(time + tz * 60);
    }
    /**
     * 获取当前UTC时间戳
     */
    static get nowTime() {
        let now = Date.now() / 1000;
        return Math.floor(now);
    }
    /**
     * 将一个日期格式化为指定的格式
     * @param date 日期
     * @param fmt yyyy:年份 MM:月份 dd:日期 hh:时 mm:分 ss:秒 S:毫秒
     */
    static formatDate(date, fmt) {
        let o = {
            "M+": date.getUTCMonth() + 1,
            "d+": date.getUTCDate(),
            "h+": date.getUTCHours(),
            "m+": date.getUTCMinutes(),
            "s+": date.getUTCSeconds(),
            "q+": Math.floor((date.getUTCMonth() + 3) / 3),
            "S": date.getUTCMilliseconds() //毫秒 
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
    static getCryptoKey() {
        let key = "0c941b1d0ee26e8deec"; // CryptoJS.enc.Utf8.parse('123456789'); //密钥必须是16位，且避免使用保留字符
        return key;
    }
    static crypto(str) {
        let key = Common.getCryptoKey();
        let encryptedData = CryptoJS.AES.encrypt(str, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        let hexData = encryptedData.ciphertext.toString();
        return hexData;
    }
    static decrypt(str) {
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
    static base64Decode(str) {
        let b = Buffer.from(str, `base64`);
        return b.toString();
    }
    static base64Encode(str) {
        let b = Buffer.from(str);
        return b.toString(`base64`);
    }
    static addZero(num) {
        return num < 10 ? '0' + num : num;
    }
    static mysqlTime2NomalTime(date) {
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
            }
            catch (error) {
                break;
            }
        } while (false);
        return date;
    }
}
exports.Common = Common;
Common._exePath = __dirname;
//# sourceMappingURL=common.js.map