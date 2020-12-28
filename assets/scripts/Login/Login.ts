// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator ,log,director} from 'cc';
import { ProtocolDefine } from '../Define/ProtocolDefine';
import { AccountEvent } from '../Event/AccountEvent';
import { Utils } from '../Utils/Utils';
import { NetwokState } from '../Utils/NetwokState';
const { ccclass, property } = _decorator;

@ccclass('Login')
export class Login extends NetwokState {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    onClickYKBtn(){
        let e : string = AccountEvent.EVENT[AccountEvent.EVENT.LOGIN];
        Utils.getGlobalController()?.Emit(e,ProtocolDefine.MsgLogin.eLoginType.LOGIN_TYPE_YK);
    }

    onClickWXBtn(){
        let e : string = AccountEvent.EVENT[AccountEvent.EVENT.LOGIN];
        Utils.getGlobalController()?.Emit(e,ProtocolDefine.MsgLogin.eLoginType.LOGIN_TYPE_WX);
    }

    onClickQQBtn(){
        let e : string = AccountEvent.EVENT[AccountEvent.EVENT.LOGIN];
        Utils.getGlobalController()?.Emit(e,ProtocolDefine.MsgLogin.eLoginType.LOGIN_TYPE_QQ);
    }

    //-----------------网络消息处理-----------------
    public onConnect(selectSeverMode : boolean,msg : any) : void{
        if(selectSeverMode){
            //显示服务器列表
            //选择某个服务器登陆
            //登陆时需要显示loading
        }else{
            this.showLoading(false);//隐藏loading动画
        }
    }
    
	public onLoginSuccess(success : boolean,arg1 = undefined) : void{
		if (success) {
            //切换界面
            director.loadScene("Lobby");

		} else {
            //登陆失败，给予提示
            log("登陆失败，给予提示");
		}
	}
}
