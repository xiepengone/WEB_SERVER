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
const config_1 = require("./lib/config");
const log_1 = require("./lib/log");
const webSvr_1 = require("./web/webSvr");
let config = config_1.Config.getInstance();
config.readCfg('./game_config.json');
let cfg = config._config;
log_1.zlog.getInstance().init('updateSvr');
let console = log_1.zlog.getInstance();
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    webSvr_1.WebSvr.instance.init(cfg.web_svr_root, cfg.web_svr_port);
});
init();
//# sourceMappingURL=server.js.map