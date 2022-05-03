"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
const fs = require("fs");
class Config {
    constructor() {
        this._config = null;
    }
    static getInstance() {
        if (Config._instance == null) {
            Config._instance = new Config();
        }
        return Config._instance;
    }
    readCfg(path) {
        this._config = JSON.parse(fs.readFileSync(path, 'utf-8'));
    }
}
exports.Config = Config;
Config._instance = null;
//# sourceMappingURL=config.js.map