import { createPoolCluster, FieldInfo } from 'mysql';
import { zlog } from './log';
let console = zlog.getInstance();

export enum EM_NODE_MYSQL_RESULT_KEY {
    NAME,
    INDEX,
};

interface MYSQLConnection {
    host: string;
    port?: number;
    user: string;
    password: string;
    database: string;
}

export class mysqlCore {
    private _hashFunc = null;
    private _retry = 3;
    private _poolCluster = createPoolCluster();
    private _objPoolMax = {};

    /**
     * 构造
     * @param hash 原型是 hash(hashKey, max) 的哈希函数.返回哈希后的值(不大于max)
     */
    constructor(hash?: Function) {
        if (hash == null) {
            hash = (hashKey, max) => {
                return (hashKey % max);
            }
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
    public addConnectionInfo(name: string, thread: number, host: string, user: string, password: string, database: string, port = 3306) {
        this.addConnection(name, thread, { host: host, user: user, password: password, database: database, port: port });
    }

    /**
     * 给连接池添加一个连接
     * @param name 连接池名.用来标示这个数据库
     * @param connectionInfo 连接信息 结构{host:...,user:...,password:...,database:...}
     * @param thread 最大连接数
     */
    public addConnection(name: string, thread: number, connectionInfo: MYSQLConnection) {
        this._objPoolMax[name] = thread;

        for (let i = 0; i < thread; ++i) {
            this._poolCluster.add(name + i, connectionInfo);
        }
    }

    private _runQuery(name: string, hashKey: number, SQL: string, ESCAPE: any[]): Promise<any> {
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
                        } else {
                            //reject(error);
                            resolve({ err: error, result: results, SQL: SQL });
                        }
                    } else {
                        // resolve(results);
                        resolve({ err: error, result: results });
                    }
                });
            });
        }

        return new Promise(query);
    }
    /**
     * 执行一个查询
     * @param name 连接池名
     * @param hashKey 用来哈希的key
     * @param SQL 执行的SQL语句
     * @param ESCAPE 用来拼装给SQL的需要ESCAPE的数组.例如SQL=SELECT * FROM tabel WHERE username=? AND password=? ESCAPE=['username','password'] 
     */
    public runQuery(name: string, hashKey: number, SQL: string, ESCAPE: any[]) {
        return this._runQuery(name, hashKey, SQL, ESCAPE);
    }

    public async runQueryAsync(name: string, hashKey: number, SQL: string, ESCAPE: any[]) {
        let ret = await this._runQuery(name, hashKey, SQL, ESCAPE);
        return ret;
    }
}