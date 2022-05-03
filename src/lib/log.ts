//import { Config } from './config';
import * as mkdirp from 'mkdirp';
import * as winston from 'winston';
// const DailyRotateFile = require('winston-daily-rotate-file');
import * as winston_drf from 'winston-daily-rotate-file';
import * as fs from 'fs';
import * as path from 'path';

var shortid = require('shortid');
export interface logInfo {
    uid?: string,
    gw?: number,
    cid?: number,
    msgType?: number,
    msgSeqno?: number
}

export class zlog {
    private logger: winston.Logger = null;
    private static readonly LOGPATH = './logs';

    private constructor() {
        if (!fs.existsSync(zlog.LOGPATH)) {
            mkdirp.sync(zlog.LOGPATH);
        }
    }

    private static _instance = null;

    public static getInstance(): zlog {
        if (zlog._instance == null) {
            zlog._instance = new zlog();
        }
        return zlog._instance;
    }

    public init(category: string) {
        if (this.logger == null) {
            const fmt = winston.format.printf(info => {
                //return `[${info.timestamp}][${info.level}]: ${info.message}`;
                return `[${info.timestamp}]: ${info.message}`;
            });

            const pid = process.env.NODE_APP_INSTANCE ? process.env.NODE_APP_INSTANCE : "";
            let finalLogPath = '';
            if (pid == "" || pid.length == 0) {
                finalLogPath = path.join(zlog.LOGPATH, category);
            } else {
                finalLogPath = path.join(zlog.LOGPATH, category, pid.toString());
            }

            this.logger = winston.createLogger({
                // format: winston.format.combine(winston.format.json(), winston.format.timestamp(), winston.format.colorize(), fmt),
                format: winston.format.combine(winston.format.json(), winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.colorize(), fmt),
                transports: [
                    new winston_drf({
                        level: 'debug',
                        dirname: finalLogPath,
                        filename: `${category}` + '-%DATE%-' + `[${process.pid}-${shortid.generate()}]` + '.log',
                        datePattern: 'YYYY-MM-DD-HH', //'YYYY-MM-DD HH:mm:ss',//'YYYY-MM-DD-HH',
                        //createTree: true,
                        maxSize: '100m',
                        maxFiles: '14d'
                    })
                ]
            });

            if (process.env.DEBUG != undefined) {
                this.logger.add(new winston.transports.Console({
                    level: 'debug'
                }));
            }
        }
    }

    private handleLogInfo(level: string, i: logInfo, message: string) {
        // let cfg = Config.getInstance()._config;
        // if (cfg) {
        //     if (cfg.local_svrid) {
        //         message = `[local:${cfg.local_svrid}]` + message;
        //     }
        //     if (cfg.public_svrid) {
        //         message = `[server:${cfg.public_svrid}]` + message;
        //     }
        // }
        if (i) {
            if (i.uid) {
                message = `[uid:${i.uid}]` + message;
            }
            if (i.gw) {
                message = `[gw:${i.gw}]` + message;
            }
            if (i.cid) {
                message = `[cid:${i.cid}]` + message;
            }
            if (i.msgType) {
                message = `[msgType:${i.msgType}]` + message;
            }
            if (i.msgSeqno) {
                message = `[seqno:${i.msgSeqno}]` + message;
            }
        }
        message = `[${level}] ` + message;
        return message;
    }

    public info(message: string, i?: logInfo, ...args: any[]) {
        if (this.logger) {
            message = this.handleLogInfo('info', i, message);
            for (let k of args) {
                message += JSON.stringify(k);
            }
            this.logger.info(message, args);
        }
    }

    public debug(message: string, i?: logInfo, ...args: any[]) {
        if (this.logger) {
            message = this.handleLogInfo('debug', i, message);
            for (let k of args) {
                message += JSON.stringify(k);
            }
            this.logger.debug(message, args);
        }
    }

    public error(message: string, i?: logInfo, ...args: any[]) {
        if (this.logger) {
            message = this.handleLogInfo('error', i, message);
            for (let k of args) {
                message += JSON.stringify(k);
            }
            this.logger.error(message, args);
        }
    }

    public warn(message: string, i?: logInfo, ...args: any[]) {
        if (this.logger) {
            message = this.handleLogInfo('warn', i, message);
            for (let k of args) {
                message += JSON.stringify(k);
            }
            this.logger.warn(message, args);
        }
    }
}
/*
import * as log4js from 'log4js';

export class zlog {
    private logger: log4js.Logger = null;

    private constructor() {
        log4js.configure('./log4js.json');
    }

    private static _instance = null;

    public static getInstance(): zlog {
        if (zlog._instance == null) {
            zlog._instance = new zlog();
        }
        return zlog._instance;
    }

    public init(category: string) {
        if (this.logger == null) {
            this.logger = log4js.getLogger(category);
        }
    }

    private handleLogInfo(i: logInfo, message: string) {
        let cfg = Config.getInstance()._config;
        if (cfg) {
            message = `[server:${cfg.public_svrid}][local:${cfg.local_svrid}]` + message;
        }
        if (i) {
            if (i.uid) {
                message = `[uid:${i.uid}]` + message;
            }
            if (i.gw) {
                message = `[gw:${i.gw}]` + message;
            }
            if (i.cid) {
                message = `[cid:${i.cid}]` + message;
            }
            if (i.msgType) {
                message = `[msgType:${i.msgType}]` + message;
            }
            if (i.msgSeqno) {
                message = `[seqno:${i.msgSeqno}]` + message;
            }
        }
        return message;
    }

    public info(message: string, i?: logInfo, ...args: any[]) {
        if (this.logger) {
            message = this.handleLogInfo(i, message);
            this.logger.info(message, args);
        }
    }

    public debug(message: string, i?: logInfo, ...args: any[]) {
        if (this.logger) {
            message = this.handleLogInfo(i, message);
            this.logger.debug(message, args);
        }
    }

    public error(message: string, i?: logInfo, ...args: any[]) {
        if (this.logger) {
            message = this.handleLogInfo(i, message);
            this.logger.error(message, args);
        }
    }

    public trace(message: string, i?: logInfo, ...args: any[]) {
        if (this.logger) {
            message = this.handleLogInfo(i, message);
            this.logger.trace(message, args);
        }
    }

    public warn(message: string, i?: logInfo, ...args: any[]) {
        if (this.logger) {
            message = this.handleLogInfo(i, message);
            this.logger.warn(message, args);
        }
    }

    public fatal(message: string, i?: logInfo, ...args: any[]) {
        if (this.logger) {
            message = this.handleLogInfo(i, message);
            this.logger.fatal(message, args);
        }
    }
}*/

