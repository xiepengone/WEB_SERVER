import { Config } from "./lib/config";
import { zlog } from "./lib/log";
import { WebSvr } from "./web/webSvr";

let config = Config.getInstance();
config.readCfg('./game_config.json');
let cfg = config._config;

zlog.getInstance().init('updateSvr');
let console = zlog.getInstance();

const init = async () => {
    WebSvr.instance.init(cfg.web_svr_root, cfg.web_svr_port);//TEST

}
init();
