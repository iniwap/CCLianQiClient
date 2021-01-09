// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node, EditBox, Label, Sprite } from 'cc';
import { eDialogBtnType, eDialogEventType, IDialog } from '../../Common/Dialog';
import { ProtocolDefine } from '../../Define/ProtocolDefine';
import { CommonEvent } from '../../Event/CommonEvent';
import { LobbyEvent } from '../../Event/LobbyEvent';
import { Utils } from '../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('FeedbackView')
export class FeedbackView extends Component {

	@property(Node)
	public feedBackList : Array<Node> = [];

	@property(Label)
	public feedBackTextList : Array<Label> = [];

	@property(Sprite)
	public selectedBg! : Sprite;
	private _feedBackTextStrList = [
		"BUG报错",
		"账号问题",
		"奖励发放",
		"充值问题",
		"改善建议",
		"发射弹幕"
	];

	@property(EditBox)
	public editBox! : EditBox;

    private _feedType : ProtocolDefine.nLobby.nFeedback.eFeedbackType = ProtocolDefine.nLobby.nFeedback.eFeedbackType.BUG;

    start () {
        // Your initialization goes here.
    }

	onEnable(){
		Utils.getGlobalController()?.On(LobbyEvent.EVENT[LobbyEvent.EVENT.RESP_FEEDBACK],
			this.OnRespFeedback.bind(this),this);
	}
	onDisable(){
		Utils.getGlobalController()?.Off(LobbyEvent.EVENT[LobbyEvent.EVENT.RESP_FEEDBACK],
			this.OnRespFeedback.bind(this),this);
	}
    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

	public OnRespFeedback(type : ProtocolDefine.nLobby.nFeedback.eFeedbackType,content : string){
		if (type == ProtocolDefine.nLobby.nFeedback.eFeedbackType.DANMU) {
			//显示弹幕
		}else{
			let dlg : IDialog = {
				type : eDialogEventType.LOBBY_EMAIL_GET_AWARD_RESULT,
				tip : "反馈成功，我们会在收到后会第一时间处理，感谢",
				hasOk : true,
				okText : "确定",
				hasCancel : true,
				cancelText : "取消",
				hasClose : false,
				closeText : "返回大厅",
				callBack : this.onClickDialogBtn
			};

			Utils.getGlobalController()?.Emit(CommonEvent.EVENT[CommonEvent.EVENT.SHOW_DIALOG],dlg);
		}
	}
	public onClickDialogBtn(btn : eDialogBtnType, type : eDialogEventType){
		if (type == eDialogEventType.FEED_BACK) {
			if(btn == eDialogBtnType.DIALOG_BTN_OK){
				//继续保持在这个界面
			}else{
				this.OnClickCloseBtn();
			}
		}
	}
	public OnClickCloseBtn() : void{
		this.node.active = false;
	}
    public OnClickSubmitBtn() : void{
		if(this.editBox.string.length != 0 && this.editBox.string.length <= 200){
			//发送反馈
			Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.REQ_FEEDBACK],
				this._feedType,this.editBox.string);
		}
		this.node.active =  false;
	}
	public OnClickFBBtn(event : any,id : string) : void{
		//背景图设置到这个位置
		//反馈类型为id
		this._feedType = Number(id) as ProtocolDefine.nLobby.nFeedback.eFeedbackType ;
		this.selectedBg.node.setPosition(this.feedBackList[Number(id)].position);
		//this.editBox.string = "";

		for(var i =0;i<6;i++){
		//	this.feedBackTextList[i].string = "<color=#261601FF>"+ this._feedBackTextStrList[i] + "</color>";
		}

		//this.feedBackTextList[Number(id)].string = "<color=#FFE8AEFF>"+ this.feedBackTextList[Number(id)].string + "</color>";

	}
}
