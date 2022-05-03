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
exports.mysqlCore = exports.EM_NODE_MYSQL_RESULT_KEY = void 0;
const mysql_1 = require("mysql");
const log_1 = require("./log");
let console = log_1.zlog.getInstance();
var EM_NODE_MYSQL_RESULT_KEY;
(function (EM_NODE_MYSQL_RESULT_KEY) {
    EM_NODE_MYSQL_RESULT_KEY[EM_NODE_MYSQL_RESULT_KEY["NAME"] = 0] = "NAME";
    EM_NODE_MYSQL_RESULT_KEY[EM_NODE_MYSQL_RESULT_KEY["INDEX"] = 1] = "INDEX";
})(EM_NODE_MYSQL_RESULT_KEY = exports.EM_NODE_MYSQL_RESULT_KEY || (exports.EM_NODE_MYSQL_RESULT_KEY = {}));
;
class mysqlCore {
    /**
     * 构造
     * @param hash 原型是 hash(hashKey, max) 的哈希函数.返回哈希后的值(不大于max)
     */
    constructor(hash) {
        this._hashFunc = null;
        this._retry = 3;
        this._poolCluster = (0, mysql_1.createPoolCluster)();
        this._objPoolMax = {};
        if (hash == null) {
            hash = (hashKey, max) => {
                return (hashKey % max);
            };
        }
        this._hashFunc = hash;
    }
    /**
     * 给连接池添加一个连接
     * @param name 连接池名.用来标示这个数据库
     * @param thread 线程数
     * @param host 目标主机
     * @param user 用户名
     * @param password 密码
     * @param database 数据库名
     * @param port 端口
     */
    addConnectionInfo(name, thread, host, user, password, database, port = 3306) {
        this.addConnection(name, thread, { host: host, user: user, password: password, database: database, port: port });
    }
    /**
     * 给连接池添加一个连接
     * @param name 连接池名.用来标示这个数据库
     * @param connectionInfo 连接信息 结构{host:...,user:...,password:...,database:...}
     * @param thread 最大连接数
     */
    addConnection(name, thread, connectionInfo) {
        this._objPoolMax[name] = thread;
        for (let i = 0; i < thread; ++i) {
            this._poolCluster.add(name + i, connectionInfo);
        }
    }
    _runQuery(name, hashKey, SQL, ESCAPE) {
        let max = this._objPoolMax[name];
        let thread = this._hashFunc(hashKey, max);
        if (thread >= max) {
            thread = max;
        }
        let stack = 0;
        let query = (resolve, reject) => {
            this._poolCluster.getConnection(name + thread, (err, connection) => {
                //if (err) throw err;
                if (err) {
                    console.error("err:", null, err, "SQL:", SQL);
                    //throw err;
                    resolve({ err: err, SQL: SQL });
                    return;
                }
                // Use the connection
                connection.query(SQL, ESCAPE, (error, results, fields) => {
                    // And done with the connection.
                    connection.release();
                    // Handle error after the release.
                    if (error) {
                        if (stack < this._retry) {
                            console.error(`Error : code[${error.code}] sql[${error.sql}] sqlMessage[${error.sqlMessage}]`);
                            stack++;
                            query(resolve, reject);
                        }
                        else {
                            //reject(error);
                            resolve({ err: error, result: results, SQL: SQL });
                        }
                    }
                    else {
                        // resolve(results);
                        resolve({ err: error, result: results });
                    }
                });
            });
        };
        return new Promise(query);
    }
    /**
     * 执行一个查询
     * @param name 连接池名
     * @param hashKey 用来哈希的key
     * @param SQL 执行的SQL语句
     * @param ESCAPE 用来拼装给SQL的需要ESCAPE的数组.例如SQL=SELECT * FROM tabel WHERE username=? AND password=? ESCAPE=['username','password']
     */
    runQuery(name, hashKey, SQL, ESCAPE) {
        return this._runQuery(name, hashKey, SQL, ESCAPE);
    }
    runQueryAsync(name, hashKey, SQL, ESCAPE) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield this._runQuery(name, hashKey, SQL, ESCAPE);
            return ret;
        });
    }
}
exports.mysqlCore = mysqlCore;
//# sourceMappingURL=mysql.js.map