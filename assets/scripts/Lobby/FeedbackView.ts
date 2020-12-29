// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node } from 'cc';
import { ProtocolDefine } from '../Define/ProtocolDefine';
import { LobbyEvent } from '../Event/LobbyEvent';
import { NetwokState } from '../Utils/NetwokState';
import { Utils } from '../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('FeedbackView')
export class FeedbackView extends NetwokState {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;
    private _feedType : ProtocolDefine.nLobby.nFeedback.eFeedbackType = ProtocolDefine.nLobby.nFeedback.eFeedbackType.BUG;

    start () {
        // Your initialization goes here.
    }

	onEnable(){
		Utils.getGlobalController()?.On(LobbyEvent.EVENT[LobbyEvent.EVENT.RESP_FEEDBACK],
			this.OnRespFeedback.bind(this));
	}
	onDisable(){
		Utils.getGlobalController()?.Off(LobbyEvent.EVENT[LobbyEvent.EVENT.RESP_FEEDBACK],
			this.OnRespFeedback.bind(this));
	}
    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

	public OnRespFeedback(type : ProtocolDefine.nLobby.nFeedback.eFeedbackType,content : string){
		if (type == ProtocolDefine.nLobby.nFeedback.eFeedbackType.DANMU) {
			//显示弹幕
		}else{
			this.showDialog ("温馨提示",content);
		}
	}

    public OnClickSubmitBtn() : void{
		// if(_inputText.text.Length != 0 && _inputText.text.Length <= 200){
		// 	//发送反馈
		// 	LobbyEvent.sV2C_Feedback fb;
		// 	fb.type = _feedType;
		// 	fb.content = _inputText.text;

		// 	LobbyEvent.EM().InvokeEvent(LobbyEvent.EVENT.REQ_FEEDBACK,(object)fb);
		// }
		// this.gameObject.SetActive (false);
	}
	public OnClickFBBtn(id : number) : void{
		// //背景图设置到这个位置
		// //反馈类型为id
		// _feedType = id as ProtocolDefine.nLobby.nFeedback.eFeedbackType;
		// _selectedBg.transform.localPosition = _feedBackList[id].transform.localPosition;
		// _inputText.text = "11";

		// for(int i =0;i<6;i++){
		// 	_feedBackTextList[i].text = "<color=#261601FF>"+ _feedBackTextStrList[i] + "</color>";
		// }

		// //_feedBackTextList[id].text = "<color=#FFE8AEFF>"+ _feedBackTextStrList[id] + "</color>";
	}
}
