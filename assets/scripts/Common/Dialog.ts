// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node ,Button,Sprite,Label ,Prefab} from 'cc';
const { ccclass, property } = _decorator;

//弹窗定义
export enum eDialogBtnType{
    DIALOG_BTN_OK,
    DIALOG_BTN_CANCEL,
    DIALOG_BTN_CLOSE,
};	
export enum eDialogEventType{
    SIMPLE,
    LOBBY_EMAIL_GET_AWARD_RESULT,
    GAME_ABANDON,
    NETWORK_ERROR,
    NETWORK_DISCONNECT,
};
export interface IDialog{
    type : eDialogEventType;
    tip : string;
    hasOk : boolean;
    okText : string,
    hasCancel : boolean;
    cancelText : string,
    hasClose : boolean;
    closeText : string,
    callBack : (btnType : eDialogBtnType,eventType : eDialogEventType) => void;
};

@ccclass('Dialog')
export class Dialog extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    @property(Button)
    public OkBtn : Button = null;//确定按钮，即同意
    @property(Label)
    public OkLabel : Label = null;//确定按钮，即同意

    @property(Button)
    public CloseBtn : Button = null;//中间关闭按钮，即忽略关闭
    @property(Label)
    public CloseLabel : Label = null;//确定按钮，即同意

    @property(Button)
    public CancelBtn : Button = null;//即拒绝按钮
    @property(Label)
    public CancelLabel : Label = null;//确定按钮，即同意

    @property(Label)
    public Tip : Label = null;//显示的内容
    
    _eventType : eDialogEventType = eDialogEventType.SIMPLE;
    
    _callBack : (btnType : eDialogBtnType,eventType : eDialogEventType) => void = null;



    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    public ShowDialog(show : boolean,dialog : IDialog) : void{
        //初始化
        this._eventType = dialog.type;
		this._callBack = dialog.callBack;
        this.Tip.string = dialog.tip;
        
        this.OkBtn.node.active = dialog.hasOk;
        this.OkLabel.string = dialog.okText;
        this.CancelBtn.node.active = dialog.hasCancel;
        this.CancelLabel.string = dialog.cancelText;
        this.CloseBtn.node.active = dialog.hasClose;
        this.CloseLabel.string = dialog.closeText;

        this.showDialog(true);
    }

    public OnOkBtnClick() : void{
        if (this._callBack != null) {
			this._callBack (eDialogBtnType.DIALOG_BTN_OK,this._eventType);
        }

        this.showDialog(false);
    }

    public OnCloseBtnClick() : void{
        if (this._callBack != null) {
			this._callBack (eDialogBtnType.DIALOG_BTN_CLOSE,this._eventType);
        }
        this.showDialog(false);
    }

    public OnCancelBtnClick() : void{
        if (this._callBack != null) {
			this._callBack (eDialogBtnType.DIALOG_BTN_CANCEL,this._eventType);
        }
        this.showDialog(false);
    }

    private showDialog(show : boolean) : void{
        this.node.active = show;
        if(!show){
            //destory
            this.destroy();
        }
    }
}
