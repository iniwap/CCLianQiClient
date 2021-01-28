// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator ,Node,director } from 'cc';
import { ProtocolDefine } from '../../Define/ProtocolDefine';
import { AccountEvent } from '../../Event/AccountEvent';
import { Utils } from '../../Utils/Utils';
import { NetworkState } from '../../Utils/NetworkState';
import { CommonDefine } from '../../Define/CommonDefine';
const { ccclass, property } = _decorator;

@ccclass('Login')
export class Login extends NetworkState {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    @property(Node)
    public loginBtns! : Node;
    

    start () {
        // Your initialization goes here.
        this.loginBtns.active = false;
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    onClickYKBtn(){
        Utils.getGlobalController()?.Emit(AccountEvent.EVENT[AccountEvent.EVENT.LOGIN],
            ProtocolDefine.MsgLogin.eLoginType.LOGIN_TYPE_YK);

        this.showLoading(true);//显示loading，防止多重点击
    }

    onClickWXBtn(){
        Utils.getGlobalController()?.Emit(AccountEvent.EVENT[AccountEvent.EVENT.LOGIN],
            ProtocolDefine.MsgLogin.eLoginType.LOGIN_TYPE_WX);

        this.showDialog("系统提示","暂不支持微信登陆","关闭");
    }

    onClickQQBtn(){
        Utils.getGlobalController()?.Emit(AccountEvent.EVENT[AccountEvent.EVENT.LOGIN],
            ProtocolDefine.MsgLogin.eLoginType.LOGIN_TYPE_QQ);
        this.showDialog("系统提示","暂不支持QQ登陆","关闭");
    }

    //-----------------网络消息处理-----------------
    public onConnect(selectSeverMode : boolean,msg : any) : void{
        this.loginBtns.active = true;//可以显示登陆按钮了
        if(selectSeverMode){
            //显示服务器列表
            //选择某个服务器登陆
            //登陆时需要显示loading
        }else{
            this.showLoading(false);//隐藏loading动画
        }
    }
    
	public onLoginSuccess(success : boolean,cb : any = null) : void{
        this.showLoading(false);//隐藏loading，防止多重点击
		if (success) {
            //切换界面
            director.loadScene(CommonDefine.eSceneType[CommonDefine.eSceneType.Lobby],(err, scene)=>{
                if(cb) cb.call();
            });

		} else {
            //登陆失败，给予提示
            this.showDialog("系统提示","登陆失败，请重试","关闭");
		}
	}
}
