// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node } from 'cc';
import { CommonDefine } from '../Define/CommonDefine';
import { ProtocolDefine } from '../Define/ProtocolDefine';
import { LobbyEvent } from '../Event/LobbyEvent';
import { NetwokState } from '../Utils/NetwokState';
import { Utils } from '../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('TalentView')
export class TalentView extends NetwokState {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    start () {
        // Your initialization goes here.
    }

    onEnable(){
        let e : string = LobbyEvent.EVENT[LobbyEvent.EVENT.RESP_OPEN_TALENTSLOT];
        Utils.getGlobalController()?.On(e,this.OnOpenTalentSlot.bind(this));
        this.OnOpenTalentSlot();// 打开界面时，主动显示

        let e2 : string = LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_USER_INFO];
        Utils.getGlobalController()?.On(e2,this.onUpdateUserInfo.bind(this));
    }

    onDisable(){
        let e : string = LobbyEvent.EVENT[LobbyEvent.EVENT.RESP_OPEN_TALENTSLOT];
        Utils.getGlobalController()?.Off(e,this.OnOpenTalentSlot.bind(this));

        let e2 : string = LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_USER_INFO];
        Utils.getGlobalController()?.Off(e2,this.onUpdateUserInfo.bind(this));
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    public onUpdateUserInfo(arg0 = undefined,arg1 = undefined) : void{
		// //假设这里传递了整个account信息，实际上没有必要，也可以另外定义，其他均为相同做法
		// SelfData self = (SelfData)data;

		// // 刷新所有用户相关的信息
		// //比如金币显示，昵称，头像等等
		// _userGold.text = ""+self.gold;
		// _userDiamond.text = ""+self.diamond;


		// //需要处理槽数和目前可安装+已安装不相等的情况
		// checkTalentSlotNum(self.talent);
		// OnClickHighTalentBtn ();

		// onUpdateTalentCost ();
	}


    public OnOpenTalentSlot(ret : any = undefined,arg1 = undefined) : void{

		if (ret == ProtocolDefine.nLobby.nTalent.eOpenTalentslotResultType.OPEN_SUCCESS) {
			//开槽成功
			//refresh ui
			//CommonUtil.Util.showDialog ("温馨提示","开槽成功，当前槽数为："+resp.currentOpenedCnt);

		}else if(ret== ProtocolDefine.nLobby.nTalent.eOpenTalentslotResultType.OPEN_FAIL_LESS_DIAMOND){
			this.showDialog ("温馨提示","开槽失败，您的晶核不足，请充值");
		}else if(ret== ProtocolDefine.nLobby.nTalent.eOpenTalentslotResultType.OPEN_FAIL_LESS_GOLG){
			this.showDialog ("温馨提示","开槽失败，您的金币不足，请充值");
		}else if(ret== ProtocolDefine.nLobby.nTalent.eOpenTalentslotResultType.OPEN_FAIL_MAX_SLOT){
			this.showDialog ("温馨提示","您的天赋槽已全部打开！");
		}


        // utfos.gold = resp.currentGold;
        // utfos.diamond = resp.currentDiamond;
        // utfos.ret = CommonDefine.eRespResultType.SUCCESS;
        // utfos.currentTalentNum = resp.currentOpenedCnt;

		// if (data.ret == CommonDefine.eRespResultType.SUCCESS) {
		// 	//开槽成功
		// 	TalentSlot tst = _talentSlotList[_openSlotId];
		// 	tst.btnState = CommonDefine.TalentSlotState.TALENT_CAN_INSTALL;
		// 	_talentSlotList [_openSlotId] = tst;

		// 	saveTalentCfg(false);
		// 	//刷新界面数据
		// 	_userGold.text = "" + utfos.gold;
		// 	_userDiamond.text = "" + utfos.diamond;
		// 	//utfos.currentTalentNum

		// 	_talentItemList [_openSlotId].updateTalentItem (this,CommonDefine.eTalentType.TALENT_NONE,_openSlotId,"","",
		// 		CommonDefine.TalentSlotState.TALENT_CAN_INSTALL);

		// 	//此处失去选中焦点
		// 	_installBtn.gameObject.SetActive(false);
		// 	_uninstallBtn.gameObject.SetActive (false);

		// } else {
			
		// }
	}
}
