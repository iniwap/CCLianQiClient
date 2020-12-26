//协议管理模块
//处理收发消息，网络链接维护
//

import {resources,log,JsonAsset} from 'cc';
import { Utils } from '../Utils/Utils';
import { ProtocolDefine } from "../Define/ProtocolDefine";
//import ROUTE_CONFIG from "../../resources/Config/RouteConfig.json";  //资源会被处理，这里无法访问到，需要cocos-api

export class ProtocolManager  {
    ROUTE_CONFIG : any = {};
    static _instance : ProtocolManager;

    _connection : any = window.pomelo;

    _ip : string = "116.62.57.248";
    _port : number = 3014;

    _isSelectServerMode : boolean = false;//  是否为选择服务器登陆模式
    _serverList  = {};
    
    _disconnectCallback!: (msg: any) => void;
    _errorCallback!: (msg : any) => void;
    _connectCallback!: (selectSeverMode: boolean, msg: any) => void;

    constructor() {
        resources.load('Config/RouteConfig',JsonAsset,(err,jsonAsset)=>{
            if(jsonAsset){
                this.ROUTE_CONFIG = jsonAsset.json;
            }
        });
    }

    static getInstance() : ProtocolManager{
        if(this._instance == null){
            this._instance = new ProtocolManager();
        }
        return this._instance;
    }

    //启动网络，只执行一次链接
    public start(isSelectServerMode:boolean,
        errcb : (msg : any) => void,
        discb: (msg : any) => void,
        connectcb: (success : boolean,msg : any) => void) : void{
            this._isSelectServerMode = isSelectServerMode;
            this._connectCallback = connectcb;
            this._errorCallback = errcb;
            this._disconnectCallback = discb;
            this.initPomeloClient();
            this.createConnect(false);
    }

    public Restart() : void{
        this.SelectServer(this._ip,this._port);
    }

    //初始化pomelo
    private  initPomeloClient() : void{
        // handle disconnect message, occours when the client is disconnect with servers
        this._connection.on('onTick', function(msg : any) {
            //log("onTick: ", msg);
        });

        this._connection.on('disconnect', (msg : any) => {
            //log("disconnect: ", msg);
            if(typeof this._disconnectCallback !== 'function') {
                return;
            }
            this._disconnectCallback(msg);
        });

        this._connection.on('io-error', (msg : any) => {
            //log("pomelo.on(io-error): ", msg);
            if(typeof this._errorCallback !== 'function') {
                return;
            }
            this._errorCallback(msg);
        });
    }
    private createConnect(isSelectServer : boolean) : void{
        this._connection.init({
            host: this._ip,
            port: this._port
        }, () => {
            if(isSelectServer){
                if(typeof this._connectCallback !== 'function') {
                    return;
                }
                //
                this._connectCallback(this._isSelectServerMode,this._serverList);
                
            }else{
                let data : JSON = JSON.parse('{}');
                this.SendMsg(ProtocolDefine.LobbyProtocol.P_LOBBY_REQ_CONNECT, data, (msg : any)=>{
                    
                    if(msg.code === 500){
                       log("连接服务器失败:onRespConnet");
                    }else{
                        if(this._isSelectServerMode){
                            this._serverList = msg;
                        }else{
                            this.SelectServer(msg.host,msg.port as number);
                        }
                    }
                });
            }
        });
    }
    //选择服务器
    private SelectServer(ip : string,port : number) : void{
        this._ip = ip;
        this._port = port;
        //首先断开之前的列表服务器
        this._connection.disconnect(()=>{
            this.createConnect(true);
        });
    }

    // private getRouteConfig(arg: string) : string {
    //     interface IRouteConfig {
    //         [key: string]: string
    //     }
    //     return (<IRouteConfig>ProtocolManager.ROUTE_CONFIG)[arg];
    // }

    public SendMsg(pID : number,msg : JSON,cb : (msg : any) => void) : void {
        //发送消息
         let pKey : string = "P" + pID;
         let route = this.ROUTE_CONFIG[pKey];
         if(cb != null){
            this._connection.request(route, msg, cb);
         }else{
            this._connection.notify(route, msg);
         }
    }
}
