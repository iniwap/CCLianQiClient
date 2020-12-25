// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node ,log} from 'cc';
import { ProtocolManager } from './ProtocolManager/ProtocolManager';
const { ccclass, property } = _decorator;

//var pomelo = window.pomelo;

@ccclass('Login')
export class Login extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    start () {
        // Your initialization goes here.

        //原则上，需要的资源加载完成再启动链接服务器
        ProtocolManager.getInstance().start(false,this.onConnectError,this.onDisconnect,this.onConnectSuccess);
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    onClickYKBtn(){
        console.log('游客登陆');
    }

    onClickWXBtn(){
        console.log('微信登陆');
    }

    onClickQQBtn(){
        console.log('qq登陆');
    }

    //-----------------网络消息处理-----------------
    private onConnectSuccess(msg : any) : void{
        log("链接成功："+msg);
    }

    private onConnectError(msg : any) : void{
        log("链接失败"+msg);
    }
    private onDisconnect(msg : any) : void{
        log("断开链接："+msg);
    }
}
