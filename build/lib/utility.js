"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utility = void 0;
const fs_1 = require("fs");
const cr = require("crypto-js");
class Utility {
    constructor() {
    }
    static SEC_MINUTE(min) {
        return (60 * min);
    }
    static SEC_HOUR(hr) {
        return Utility.SEC_MINUTE(60);
    }
    static SEC_DAY(d) {
        return Utility.SEC_HOUR(24);
    }
    /**
     * 取随机小数
     * @param max 最大
     * @param min 最小
     */
    static RandomDouble(max, min = 0) {
        return ((Math.random() * (max - min)) + min);
    }
    /**
     * 取随机整数
     * @param max 最大
     * @param min 最小
     */
    static RandomInt(max, min = 0) {
        return Math.floor(Utility.RandomDouble(max, min));
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
    /**
     * 当前时间字符串 例如 2018-03-20 12:05:25
     */
    static get now() {
        return Utility.getTimeStr(Date.now());
    }
    static getTimeStr(timestamp) {
        timestamp = Math.floor(timestamp);
        if (timestamp.toString().length == 10) {
            timestamp *= 1000;
        }
        let ret = Utility.formatDate(new Date(timestamp), 'yyyy-MM-dd hh:mm:ss');
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
        let tz = new Date().getTimezoneOffset() * -1;
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
     * 获取今天零点时间
     */
    static get todayZero() {
        let now = new Date();
        now.setHours(0, 0, 0, 0);
        return Math.floor(now.getTime() / 1000);
    }
    /**
     * 判断当前是否是debug环境[主目录下是否有debug文件]
     */
    static get DEBUG() {
        return (0, fs_1.existsSync)(__dirname + '/debug');
    }
    /**
     * 将input转成base64
     * @param input 原字符串
     */
    static Base64Encode(input) {
        let temp = Buffer.from(input); //new Buffer(input);
        let ret = temp.toString('base64');
        return ret;
        //return new Buffer(input).toString('base64');
    }
    /**
     * 将base64解密
     * @param base64Str 加密后的base64字符
     */
    static Base64Decode(base64Str) {
        let temp = Buffer.from(base64Str, 'base64');
        let ret = temp.toString();
        return ret;
        // return new Buffer(base64Str, 'base64').toString();
    }
    static shortIP(ip) {
        let find = '::ffff:';
        if (ip && ip.search(find) != -1) {
            ip = ip.substr(find.length, ip.length - find.length);
        }
        return ip;
    }
    /**
     *
     * @param req
     */
    static GetClientIP(req) {
        let fetchIP = function (req) {
            return req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress ||
                req.remoteAddress;
        };
        let ip = fetchIP(req);
        return Utility.shortIP(ip);
    }
    static generatRandomString(len) {
        const CHARS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h',
            'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E',
            'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '!', '@', '#', '$', '&', '*'];
        let str = '';
        for (let i = 0; i < len; ++i) {
            let idx = Utility.RandomInt(CHARS.length);
            str += CHARS[idx];
        }
        return str;
    }
    /**
     * 将一个32位uint大小强转成32位int
     * @param val
     */
    static getInt32(val) {
        let buf = Buffer.alloc(4); // new Buffer(4);
        buf.writeUInt32LE(val, 0);
        return buf.readInt32LE(0);
    }
    // 判断array中的任意一个值符合judge的判断.等同于if (judge(array[0]) || judge(array[1]) ....)
    static anyOfList(array, judge) {
        if (judge == null) {
            judge = function (element) {
                if (element > 0)
                    return true;
                return false;
            };
        }
        for (let key in array) {
            if (judge(array[key])) {
                return true;
            }
        }
        return false;
    }
    // 判断array中的所有值都符合judge的判断.等同于if (judge(array[0]) && judge(array[1]) ....)
    static allOfList(array, judge) {
        if (judge == null) {
            judge = function (element) {
                if (element > 0)
                    return true;
                return false;
            };
        }
        for (let key in array) {
            if (!judge(array[key])) {
                return false;
            }
        }
        return true;
    }
    static sizeof(obj) {
        let len = 0;
        for (const key in obj) {
            if (typeof obj[key] == 'object') {
                len += Utility.sizeof(obj[key]);
            }
            else {
                let size = Number.parseInt(obj[key]);
                if (size == 9) {
                    len += 8;
                }
                else {
                    len += size;
                }
            }
        }
        return len;
    }
    static minSize(obj) {
        let len = 0;
        for (const key in obj) {
            if (typeof obj[key] == 'object') {
                len += 4;
            }
            else {
                let size = Number.parseInt(obj[key]);
                if (size == 9) {
                    len += 8;
                }
                else {
                    len += size;
                }
            }
        }
        return len;
    }
    static int642Buffer(num) {
        let negate = false;
        const VAL32 = 0x100000000;
        negate = (num < 0);
        num = Math.abs(num);
        let lo = num % VAL32;
        let hi = num / VAL32;
        if (hi > VAL32)
            throw new RangeError(hi + ' is outside Int64 range');
        hi = hi | 0;
        let b = new Buffer(8);
        for (var i = 0; i < 8; ++i) {
            b[i] = lo & 0xff;
            lo = i == 4 ? hi : lo >>> 8;
        }
        // Restore sign of passed argument
        if (negate) {
            let carry = 1;
            for (var i = 0; i < 8; ++i) {
                var v = (b[i] ^ 0xff) + carry;
                b[i] = v & 0xff;
                carry = v >> 8;
            }
        }
        return b;
    }
    /**
     * 使用私钥解密FB小游戏传出的数据
     * @param data
     */
    static decodeFBInstantSignedData(data) {
        let dataPart = data.split('.');
        if (dataPart.length == 2) {
            dataPart[0] = dataPart[0].replace(/-/g, '+').replace(/_/g, '/');
            const signature = cr.enc.Base64.parse(dataPart[0]).toString();
            const dataHashDebug = cr.HmacSHA256(dataPart[1], Utility.FBINSTANT_APP_SECRET_DEBUG).toString();
            const dataHash = cr.HmacSHA256(dataPart[1], Utility.FBINSTANT_APP_SECRET).toString();
            var isValid = ((signature === dataHash) || (signature === dataHashDebug));
            if (!isValid) {
                console.info('signed data verify error : ', signature, dataHash, dataHashDebug);
                return null;
            }
            const json = cr.enc.Base64.parse(dataPart[1]).toString(cr.enc.Utf8);
            // console.info('facebook signed decoded 1 : ', json);
            const encodedData = JSON.parse(json);
            // console.info('facebook signed decoded : ', encodedData);
            return encodedData;
        }
        return null;
    }
    static deleteFromArr(arr, item, key) {
        for (let i = 0; i < arr.length; ++i) {
            let element = arr[i];
            if (key) {
                if (element[key] == item[key]) {
                    delete arr[i];
                    arr.splice(i, 1);
                    --i;
                }
            }
            else {
                if (element == item) {
                    delete arr[i];
                    arr.splice(i, 1);
                    --i;
                }
            }
        }
    }
    static findFromArr(arr, item, key) {
        for (let i = 0; i < arr.length; ++i) {
            let element = arr[i];
            if (key) {
                if (element[key] == item[key]) {
                    return arr[i];
                }
            }
            else {
                if (element == item) {
                    return arr[i];
                }
            }
        }
        return null;
    }
}
exports.Utility = Utility;
Utility.FBINSTANT_APP_SECRET = '609ecb9ec9dd345a6ae04f3a1c447bb1';
Utility.FBINSTANT_APP_SECRET_DEBUG = '9b792b70a00018f85ae8018bba21364c';
//# sourceMappingURL=utility.js.map