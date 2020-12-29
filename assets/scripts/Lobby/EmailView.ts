// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node } from 'cc';
import { ProtocolDefine } from '../Define/ProtocolDefine';
import { LobbyEvent } from '../Event/LobbyEvent';
import { Utils } from '../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('EmailView')
export class EmailView extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

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
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
	// }

    public OnUpdateEmail(arg0 : any = undefined,arg1 : any = undefined) : void{
		//直接使用model数据
		//Lobby.Lobby.privateMsgList
	}
    public OnShowUpdateEmailResult(awardEmailId : number,
        type : ProtocolDefine.nLobby.nSysOrPrivateMsg.eUpdateEmailType) : void{

		// int index = -1;

		// for (int i = 0; i < _emailList.Count; i++) {
		// 	if (_emailList [i].getEmailID () == re.id) {
		// 		index = i;
		// 		break;
		// 	}
		// }
		// if (index == -1)
		// 	return;
		
		// if (re.type == CommonDefine.eUpdateEmailType.READ) {
		// 	//设置已读
		// 	_emailList [index].updateHasRead();

		// } else if (re.type == CommonDefine.eUpdateEmailType.DEL) {
		// 	//删除
		// 	Destroy(_emailList [index].gameObject);
		// 	_emailList.RemoveAt (index);
		// 	//需要刷新整个界面
		// 	//将默认选择移动到第一个，设置当前选择
		// 	updateDefaultSelect();

		// } else if (re.type == CommonDefine.eUpdateEmailType.GET_AWARD) {
		// 	//恭喜获得xx 提示
		// 	ViewManagerEvent.s_ShowDialog d;
		// 	d.callBack = onClickDialogBtn;
		// 	d.hasCancel = false;
		// 	d.hasClose = true;
		// 	d.hasOk = false;
		// 	d.tip = "温馨提示";
		// 	CommonUtil.EmailContent content = _emailList [index].getContent ();
		// 	if (content.type == CommonUtil.EmailContent.AWARD_TYPE.GOLD) {
		// 		d.tip = "恭喜获得" + content.awardCnt + "积分！祝您游戏愉快～";	
		// 	} else if (_emailList [index].getContent ().type == CommonUtil.EmailContent.AWARD_TYPE.PROP) {
		// 		d.tip = "恭喜获得永久皮肤" + "吃遍天下" + "！祝您游戏愉快～";	
		// 	}

		// 	d.type = CommonDefine.eDialogEventType.LOBBY_EMAIL_GET_AWARD_RESULT;

		// 	ViewManagerEvent.EM ().InvokeEvent (ViewManagerEvent.EVENT.SHOW_DIALOG, (object)d);

		// 	_emailList [index].getContent().hasGottenAward = true;
		// 	//更新
		// 	_awardBtn.interactable = false;
		// 	Text txt = _awardBtn.GetComponentInChildren<Text> ();
		// 	txt.text = "已领取";

		// 	//all btn 
		// 	Invoke("checkIsGettingAllAward", 0.001f);
		// }
		// updateReadUnRead ();
	}
}
