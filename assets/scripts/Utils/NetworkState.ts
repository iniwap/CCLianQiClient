// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node, instantiate, Prefab } from 'cc';
import { Dialog, eDialogBtnType, eDialogEventType, IDialog } from '../Common/Dialog';
import { Loading } from '../Common/Loading';
import { AccountEvent } from '../Event/AccountEvent';
import { CommonEvent } from '../Event/CommonEvent';
import { Utils } from './Utils';
const { ccclass, property } = _decorator;

@ccclass('NetworkState')
export class NetworkState extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;
    @property(Prefab)
    public DialogPrefab! : Prefab;

    @property(Prefab)
    public LoadingPrefab! : Prefab;
    
    public start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    public onEnable(){
        //这些事件每个scene都要监听
        Utils.getGlobalController()?.On(AccountEvent.EVENT[AccountEvent.EVENT.CONNECT_SERVER],
            this.onConnect.bind(this),this);

        Utils.getGlobalController()?.On(AccountEvent.EVENT[AccountEvent.EVENT.NETWORK_ERROR],
            this.onConnectError.bind(this),this);

        Utils.getGlobalController()?.On(AccountEvent.EVENT[AccountEvent.EVENT.NETWORK_DISCONNECT],
            this.onDisconnect.bind(this),this);

        Utils.getGlobalController()?.On(AccountEvent.EVENT[AccountEvent.EVENT.LOGIN_SUCCESS],
            this.onLoginSuccess.bind(this),this);

        Utils.getGlobalController()?.On(CommonEvent.EVENT[CommonEvent.EVENT.SHOW_LOADING],
            this.showLoading.bind(this),this);

        Utils.getGlobalController()?.On(CommonEvent.EVENT[CommonEvent.EVENT.SHOW_DIALOG],
            this.OnShowDialog.bind(this),this);
    }
    public onDisable(){
        //这些事件每个scene都要监听
        Utils.getGlobalController()?.Off(AccountEvent.EVENT[AccountEvent.EVENT.CONNECT_SERVER],
            this.onConnect.bind(this),this);

        Utils.getGlobalController()?.Off(AccountEvent.EVENT[AccountEvent.EVENT.NETWORK_ERROR],
            this.onConnectError.bind(this),this);

        Utils.getGlobalController()?.Off(AccountEvent.EVENT[AccountEvent.EVENT.NETWORK_DISCONNECT],
            this.onDisconnect.bind(this),this);

        Utils.getGlobalController()?.Off(AccountEvent.EVENT[AccountEvent.EVENT.LOGIN_SUCCESS],
            this.onLoginSuccess.bind(this),this);

        Utils.getGlobalController()?.Off(CommonEvent.EVENT[CommonEvent.EVENT.SHOW_LOADING],
            this.showLoading.bind(this),this);

        Utils.getGlobalController()?.Off(CommonEvent.EVENT[CommonEvent.EVENT.SHOW_DIALOG],
            this.OnShowDialog.bind(this),this);
    }

    public onConnect(selectSeverMode : boolean,msg : any) : void{
        //只有登陆界面才处理，其他继承不需要重写
    }

    public onConnectError(msg : any,agr1 = undefined) : void{
        //init dialog
        let node : Node = instantiate(this.DialogPrefab);
        node.parent = this.node.parent;
        node.setPosition(0, 0);
        //show dialog
        let dlg : Dialog = node.getComponent("Dialog") as Dialog;
        let iDlg : IDialog = {
            type : eDialogEventType.NETWORK_ERROR,
            tip : "您的网络存在异常，请检查网络设置~",
            hasOk : true,
            okText : '重试',
            hasCancel : true,
            cancelText : "检查网络",
            hasClose : false,
            closeText :"",
            callBack : this.onClickDialogBtn,
        };
        dlg.ShowDialog(true,iDlg);
    }
    public onDisconnect(msg : any,arg1 = undefined) : void{
        //这里需要判断是否在登陆界面，显示不同的提示
        //init dialog
        let node : Node = instantiate(this.DialogPrefab);
        node.parent = this.node.parent;
        node.setPosition(0, 0);
        //show dialog
        let dlg : Dialog = node.getComponent("Dialog") as Dialog;
        let iDlg : IDialog = {
            type : eDialogEventType.NETWORK_DISCONNECT,
            tip : "您已经与服务器断开连接，是否重连？",
            hasOk : true,
            okText : "重连",
            hasCancel : true,
            cancelText : "取消",
            hasClose : false,
            closeText :"",
            callBack : this.onClickDialogBtn,
        };
        dlg.ShowDialog(true,iDlg);
    }

    public onClickDialogBtn(btn:eDialogBtnType, type:eDialogEventType) : void{
		if (type == eDialogEventType.NETWORK_DISCONNECT) {
			if (btn == eDialogBtnType.DIALOG_BTN_OK) {
				//重连
				Utils.getGlobalController()?.Emit(AccountEvent.EVENT[AccountEvent.EVENT.RELOGIN],true);
			}else{
				//不操作
			}
		}else if (type == eDialogEventType.NETWORK_ERROR) {
			if (btn == eDialogBtnType.DIALOG_BTN_OK) {
                // 重试
				Utils.getGlobalController()?.Emit(AccountEvent.EVENT[AccountEvent.EVENT.RELOGIN],true);
			}else{
                //可以去网络设置 打开网络设置面板
			}
		}
	}
    
	public onLoginSuccess(success : boolean,cb = null) : void{

    }
    
    //显示登陆loading
	public showLoading(show : boolean) : void{
        let ld = this.node.parent?.getComponentInChildren(Loading);
        if(ld == null){
            let node : Node = instantiate(this.LoadingPrefab);
            node.parent = this.node.parent;
            node.setPosition(0, 0);
            //show loading
            let loading : Loading = node.getComponent(Loading)!;
            loading.ShowLoading(show);
        }else{
            let loading : Loading = ld.getComponent(Loading)!;
            loading.ShowLoading(show);
        }
    }

    public OnShowDialog(iDlg : IDialog){
		let node : Node = instantiate(this.DialogPrefab);
        node.parent = this.node.parent;
        node.setPosition(0, 0);
        //show dialog
        let dlg : Dialog = node.getComponent("Dialog") as Dialog;
        dlg.ShowDialog(true,iDlg);
    }

    //显示简单提示性弹窗
	public showDialog(title : string,content : string,okText : string = "确定") : void{
        let iDlg : IDialog = {
            type : eDialogEventType.SIMPLE,
            tip : content,
			hasOk : false,
			okText : "",
			hasCancel : false,
			cancelText : "",
			hasClose : true,
			closeText : okText,
            callBack : ()=>{},
        };
        this.OnShowDialog(iDlg);
	}
}
