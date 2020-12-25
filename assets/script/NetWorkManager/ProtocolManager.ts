//协议管理模块
//处理收发消息，网络链接维护
//

import routeConfig from "../../res/Config/RouteConfig.json";

var PomeloClient = window.pomelo;

export class ProtocolManager  {
    
    static _instance : ProtocolManager;
    _ip : string = "116.62.57.248";
    _port : number = 3014;
    _isSelectServerMode : boolean = false;//  是否为选择服务器登陆模式

    _connectSuccess : boolean = false;
    _canLogin : boolean = false;

    constructor() {
        
        console.log(routeConfig);
    }

    static getInstance() : ProtocolManager{
        if(this._instance == null){
            this._instance = new ProtocolManager();
        }
        return this._instance;
    }

    static _connection : any = null;
    private createConnect(){
        let connection : any = new PomeloClient();
        //connection.on
    }
}
