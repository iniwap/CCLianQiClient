// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Label, Sprite, Button ,Node, Prefab, UITransform, instantiate} from 'cc';
import { Dialog, eDialogBtnType, eDialogEventType, IDialog } from '../../Common/Dialog';
import { ProtocolDefine } from '../../Define/ProtocolDefine';
import { CommonEvent } from '../../Event/CommonEvent';
import { LobbyEvent } from '../../Event/LobbyEvent';
import { Lobby } from '../../Model/Lobby';
import { Utils } from '../../Utils/Utils';
import { EmailTitleItem } from './EmailTitleItem';
const { ccclass, property } = _decorator;

@ccclass('EmailView')
export class EmailView extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
	// serializableDummy = 0;
	@property(Node)
	emailContainer! : Node;

	@property(Label)
	noEmail! : Label;
	@property(Label)
	emailReadInfo! : Label;
	@property(Label)
	emailContent! : Label;
	@property(Label)
	emailTime! : Label;
	@property(Label)
	emailAuthor! : Label;

	// 如果是奖励邮件
	@property(Sprite)
	awardIcon! : Sprite;
	@property(Label)
	awardCnt! : Label;

	@property(Label)
	awardTotal! : Label;

	@property(Button)
	awardBtn! : Button;//领取奖励按钮
	@property(Button)
	allAwardBtn! : Button;//一键领取奖励按钮
	@property(Node)
	awardPanel! : Node;

	@property(Node)
	emailRoot! : Node;

	@property(Prefab)
	emailTitleItemPrefab! : Prefab;
	private _emailList : Array<EmailTitleItem> = [];

	_currentSelectEmailID : number = 0;
	_hasGettingAllAward : boolean = false;

    start () {
        // Your initialization goes here.
	}
	
	onEnable(){
		
		Utils.getGlobalController()?.On(LobbyEvent.EVENT[LobbyEvent.EVENT.SHOW_UPDATE_EMAIL_RESULT],
			this.OnShowUpdateEmailResult.bind(this));
		
		Utils.getGlobalController()?.On(LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_PRIVATEMSG],
			this.OnUpdateEmail.bind(this));
		
		this.OnUpdateEmail();
    }

    onDisable(){
		Utils.getGlobalController()?.Off(LobbyEvent.EVENT[LobbyEvent.EVENT.SHOW_UPDATE_EMAIL_RESULT],
			this.OnShowUpdateEmailResult.bind(this));
		
		Utils.getGlobalController()?.Off(LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_PRIVATEMSG],
			this.OnUpdateEmail.bind(this));

		this.removeAllEmail();
		this._hasGettingAllAward = false;
    }

	private removeAllEmail(){
		//隐藏删除
		for (var i = 0; i < this._emailList.length; i++) {
			this._emailList[i].node.destroy();
		}
		this._emailList = [];
	}
    // update (deltaTime: number) {
    //     // Your update function goes here.
	// }
	//------------------------------以下界面事件传出-----------------------------------------------
	public OnClickCloseBtn(){
		this.node.active = false;
	}
	public OnClickGetAwardBtn() : void{
		//
		if(this._currentSelectEmailID != -1){
			//REQ_UPDATE_EMAIL
			Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.REQ_UPDATE_EMAIL],
				this._emailList[this._currentSelectEmailID].getEmailID(),
				ProtocolDefine.nLobby.nSysOrPrivateMsg.eUpdateEmailType.GET_AWARD);
		}
	}

	public OnClickGetAllAwardBtn() : void{
		//这里记录 是否在一键领取
		this._hasGettingAllAward = true;

		for(var i = 0;i < this._emailList.length;i++){
			if (this._emailList[i].getContent().hasAward
			   && !this._emailList[i].getContent().hasGottenAward) {
				Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.REQ_UPDATE_EMAIL],
					this._emailList[i].getEmailID(),
					ProtocolDefine.nLobby.nSysOrPrivateMsg.eUpdateEmailType.GET_AWARD);
				break;
			}
		}

		this.allAwardBtn.interactable = false;
	}

	//----------------------------网络更新界面--------------------------
    public OnUpdateEmail(arg0 : any = undefined,arg1 : any = undefined) : void{
		//直接使用model数据
		// 设置左侧 滑动范围大小
		//Lobby.Lobby.privateMsgList
		let content : UITransform = this.emailRoot.getComponent(UITransform)!;
		if(content) content.setContentSize(content.width,Lobby.LobbyData.privateMsgList.length * 160);

		this.removeAllEmail ();
		for (var i = 0; i < Lobby.LobbyData.privateMsgList.length; i++) {
			//生成保存信息
			let date = new Date(Lobby.LobbyData.privateMsgList[i].send_time);//.format("yyyy/MM/dd");
			let time : string = date.getFullYear() + '/' + date.getMonth() + "/" + date.getDate();
			this._emailList.push(this.createEmailItem(i,Lobby.LobbyData.privateMsgList[i].id,
				Lobby.LobbyData.privateMsgList[i].author,
				JSON.parse( Lobby.LobbyData.privateMsgList[i].content),
				Lobby.LobbyData.privateMsgList[i].has_read != 0,
				time,
				Lobby.LobbyData.privateMsgList[i].title));
		}

		this.checkAllAwardBtnCanShow ();

		this.updateDefaultSelect ();

		this.updateReadUnRead ();
	}
    public OnShowUpdateEmailResult(awardEmailId : number,
        type : ProtocolDefine.nLobby.nSysOrPrivateMsg.eUpdateEmailType) : void{

		let index : number= -1;

		for (var i = 0; i < this._emailList.length; i++) {
			if (this._emailList[i].getEmailID() == awardEmailId) {
				index = i;
				break;
			}
		}
		if (index == -1)
			return;
		
		if (type == ProtocolDefine.nLobby.nSysOrPrivateMsg.eUpdateEmailType.READ) {
			//设置已读
			this._emailList[index].updateHasRead();

		} else if (type == ProtocolDefine.nLobby.nSysOrPrivateMsg.eUpdateEmailType.DEL) {
			//删除
			this._emailList[index].node.destroy();
			this._emailList.splice(index,1);
			//需要刷新整个界面
			//将默认选择移动到第一个，设置当前选择
			this.updateDefaultSelect();

		} else if (type == ProtocolDefine.nLobby.nSysOrPrivateMsg.eUpdateEmailType.GET_AWARD) {
			//恭喜获得xx 提示
			let  content : Lobby.EmailContent = this._emailList[index].getContent();
			let tip : string = "";
			if (content.type == Lobby.eAwardType.GOLD) {
				tip = "恭喜获得" + content.awardCnt + "积分！祝您游戏愉快～";	
			} else if (this._emailList [index].getContent ().type == Lobby.eAwardType.PROP) {
				tip = "恭喜获得永久皮肤" + "吃遍天下" + "x" + content.awardCnt + "！祝您游戏愉快～";	
			}
			let dlg : IDialog = {
				type : eDialogEventType.LOBBY_EMAIL_GET_AWARD_RESULT,
				tip : tip,
				hasOk : false,
				okText : "确定",
				hasCancel : false,
				cancelText : "取消",
				hasClose : true,
				closeText : "确定",
				callBack : this.onClickDialogBtn
			};

			Utils.getGlobalController()?.Emit(CommonEvent.EVENT[CommonEvent.EVENT.SHOW_DIALOG],dlg);
			this._emailList[index].getContent().hasGottenAward = true;
			//更新
			this.awardBtn.interactable = false;
			this.awardBtn.getComponentInChildren(Label)!.string  = "已领取";
			//all btn 
			this.scheduleOnce(() => {
				// 这里的 this 指向 component
				this.checkIsGettingAllAward();
			}, 0.01);
		}

		this.updateReadUnRead ();
	}
	public onClickDialogBtn(btn : eDialogBtnType, type : eDialogEventType){
		if (type == eDialogEventType.LOBBY_EMAIL_GET_AWARD_RESULT) {

		}
	}
	//----
	public selectEmailTitleItem(emailID : number) : void{
		let id : number = -1;
		for (var i = 0; i < this._emailList.length; i++) {
			if (this._emailList[i].getEmailID() != emailID) {
				this._emailList[i].unselectItem();
			} else {
				id = i;
				this._emailList[i].selectItem();
			}
		}

		if (id == -1)
			return;

		this._currentSelectEmailID = id;

		if (!this._emailList [this._currentSelectEmailID].getHasRead ()) {
			Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.REQ_UPDATE_EMAIL],
				this._emailList[this._currentSelectEmailID].getEmailID(),
				ProtocolDefine.nLobby.nSysOrPrivateMsg.eUpdateEmailType.READ);
		}

		//右侧信息刷新
		let content : Lobby.EmailContent = this._emailList[id].getContent();
		this.emailContent.string = content.content;
		this.emailAuthor.string = this._emailList[id].getAuthor();
		this.emailTime.string = this._emailList[id].getDate();

		if (content.hasAward) {
			this.awardPanel.active = true;
			/*
			public AWARD_TYPE type;
			public int prop_id;//如果有
			public string awardIcon;//可以从道具列表中查到相关图标
			*/
			if (content.hasGottenAward) {
				this.awardBtn.interactable = false;
				this.awardBtn.getComponentInChildren(Label)!.string = "已领取";
			} else {
				this.awardBtn.interactable = true;
				this.awardBtn.getComponentInChildren(Label)!.string = "领取奖励";
			}

			if (content.type == Lobby.eAwardType.GOLD) {
				this.awardCnt.node.active = true;
				this.awardTotal.node.active = false;
				this.awardCnt.string = ""+content.awardCnt;
			} else if (content.type == Lobby.eAwardType.PROP) {
				this.awardCnt.node.active = false;
				this.awardTotal.node.active = true;
				this.awardTotal.string = "x"+content.awardCnt;
			}

			//_awardIcon.sprite = CommonUtil.Util.getPropIconByPropID (content.prop_id);

		}else{
			this.awardPanel.active = false;
		}
	}
	public createEmailItem(index : number,id : number,author : string,content : Lobby.EmailContent,
		hasRead : boolean,date : string,title : string) : EmailTitleItem{

		let ei : Node = instantiate(this.emailTitleItemPrefab);
		let emailItem : EmailTitleItem = ei.getComponent(EmailTitleItem)!;
		emailItem.node.setParent(this.emailRoot);

		emailItem.node.setPosition(0,- index * 160 - 40,0);

		emailItem.updateEmailTitleItem (this.selectEmailTitleItem.bind(this),id,author,content,title,date,hasRead);

		//emailItem.node.setScale(emailItem.node.scale * CommonUtil.Util.getScreenScale());

		return emailItem;
	}

	//设置是否存在未领取的奖励
	public checkAllAwardBtnCanShow() : void{

		let hasAward : boolean = false;
		for (var i = 0; i < this._emailList.length; i++) {
			let content : Lobby.EmailContent = this._emailList[i].getContent();
			if(content.hasAward){
				hasAward = true;
				break;
			}
		}

		if (hasAward) {
			this.allAwardBtn.node.active = true;
		} else {
			this.allAwardBtn.node.active = false;
		}

		// 是否已经全部领取
		let hasAllGotten : boolean = true;

		for (var i = 0; i < this._emailList.length; i++) {
			let content : Lobby.EmailContent = this._emailList[i].getContent();
			if(content.hasAward && !content.hasGottenAward){
				hasAllGotten = false;
				break;
			}
		}
		if (hasAllGotten) {
			//_allAwardBtn.interactable = false;
			this.allAwardBtn.node.active = false;
		} else {
			this.allAwardBtn.interactable = true;
		}
	}
	private updateReadUnRead() : void{
		let all : number = this._emailList.length;
		let  unread : number = 0;
		for (var i = 0; i < all; i++) {
			if (!this._emailList[i].getHasRead()) {
				unread++;
			}
		}
		this.emailReadInfo.string = "未读邮件"+unread + "/" + all;
	}
	private updateDefaultSelect() : void{
		if(this._emailList.length > 0){
			this._emailList[0].OnClickTitleBtn();//默认选中第0个
			this.emailContainer.active = true;
			this.noEmail.node.active = false;
		}else{
			this._currentSelectEmailID = -1;
			this.emailContainer.active = false;
			this.noEmail.node.active = true;
		}
	}
	private checkIsGettingAllAward() : void{
		let hasAllGotten : boolean = true;
		if(this._hasGettingAllAward){
			for(var i = 0;i < this._emailList.length;i++){
				if (this._emailList[i].getContent().hasAward
					&& !this._emailList[i].getContent().hasGottenAward) {

					Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.REQ_UPDATE_EMAIL],
						this._emailList[i].getEmailID(),
						ProtocolDefine.nLobby.nSysOrPrivateMsg.eUpdateEmailType.GET_AWARD);

					hasAllGotten = false;

					break;
				}
			}
			if(hasAllGotten){
				this._hasGettingAllAward = false;
			}
		}

		this.checkAllAwardBtnCanShow();
	}
}
