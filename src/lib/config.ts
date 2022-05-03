import * as fs from 'fs';

export class Config {
    private constructor() {

    }

    private static _instance:Config = null;
    public static getInstance():Config {
        if (Config._instance == null) {
            Config._instance = new Config();
        }
        return Config._instance;
    }

    public readCfg(path:string) {
        this._config = JSON.parse(fs.readFileSync(path, 'utf-8'));
    }

    public _config = null;
}