// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Node, Label, Sprite, Button, Prefab, UITransform, resources, SpriteFrame, instantiate, JsonAsset, CCFloat } from 'cc';
import { CommonDefine } from '../../../Define/CommonDefine';
import { ProtocolDefine } from '../../../Define/ProtocolDefine';
import { LobbyEvent } from '../../../Event/LobbyEvent';
import { nAccount } from '../../../Model/Account';
import { nLobby } from '../../../Model/Lobby';
import { NetworkState } from '../../../Utils/NetworkState';
import { Utils } from '../../../Utils/Utils';
import { TalentCostItem } from './TalentCostItem';
import { TalentItem } from './TalentItem';
const { ccclass, property } = _decorator;

//只是保存天赋数据
interface ITalentData{
	talentType : nLobby.eTalentType;
	tname : string;
	des : string;
	cost : number;// 装备增加消耗
};

//用来保存可配置天赋槽
interface ITalentSlot{
	talentType : nLobby.eTalentType;
	tid : number;
	btnState : nLobby.eTalentSlotState;
}

@ccclass('TalentView')
export class TalentView extends NetworkState {
	//#region 界面
	//用户信息
	@property(Label)
	public userGold! : Label;
	@property(Label)
	public userDiamond! : Label;
	@property(Sprite)
	public currentTalentIcon! : Sprite;
	@property(Label)
	public currentTalentName! : Label;
	@property(Label)
	public currentTalentDes! : Label;

	private _talentType : nLobby.eTalentType = nLobby.eTalentType.TALENT_NONE;
	private _prevTalentType : nLobby.eTalentType = nLobby.eTalentType.TALENT_NONE;
	private _isBaseSelected : boolean = false;

	@property(Button)
	public baseTalentBtn! : Button;
	@property(Button)
	public highTalentBtn! : Button;
	@property(Button)
	public installBtn! : Button;
	@property(Button)
	public uninstallBtn! : Button;
	@property(Button)
	public toLeftSwitchBtn! : Button;
	@property(Button)
	public toRightSwitchBtn! : Button;
	@property(Node)
	public talentItemRoot! : Node;
	@property(Prefab)
	public talentPrefab! : Prefab;
	@property(CCFloat)
	public talentInteral : number = 0;
	private _talentItemList : Array<TalentItem> = [];

	private _canInstallId : number = 0;
	private _openSlotId : number = 0;
	@property(Label)
	public currentAndTotal! : Label;


	//消耗详情
	@property(Node)
	public baseTalentCostInfoRoot! : Node;
	@property(Node)
	public highTalentCostInfoRoot! : Node;
	@property(Prefab)
	public talentCostPrefab! : Prefab;
	@property(CCFloat)
	public  talentCostInteral : number = 0;
	private _talentCostItemList : Array<TalentCostItem> = [];
	@property(Label)
	public totalCost! : Label;

	private _talentList : Array<ITalentData> = [];
	private _talentSlotList : Array<ITalentSlot> = [];
	//#endregion
    start () {
		// Your initialization goes here.
    }

    onEnable(){
		super.onEnable();
		Utils.getGlobalController()?.On(LobbyEvent.EVENT[LobbyEvent.EVENT.RESP_OPEN_TALENTSLOT],
			this.OnOpenTalentSlot.bind(this),this);
		Utils.getGlobalController()?.On(LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_USER_INFO],
			this.onUpdateUserInfo.bind(this),this);

		this.loadTalentCfg();
    }

    onDisable(){
		super.onDisable();
		Utils.getGlobalController()?.Off(LobbyEvent.EVENT[LobbyEvent.EVENT.RESP_OPEN_TALENTSLOT],
			this.OnOpenTalentSlot.bind(this),this);

		Utils.getGlobalController()?.Off(LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_USER_INFO],
			this.onUpdateUserInfo.bind(this),this);

		//隐藏删除 -- 也可以改为不删除，后续更新
		for (var i = 0; i < this._talentItemList.length; i++) {
			this._talentItemList[i].node.destroy();
		}
		this._talentItemList = [];

		for (var i = 0; i < this._talentCostItemList.length; i++) {
			this._talentCostItemList[i].node.destroy();
		}
		this._talentCostItemList = [];
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
	// }
		//------------------------------以下界面事件传出-----------------------------------------------
	//基础天赋
	public OnClickBaseTalentBtn() : void{
		if(this._isBaseSelected){
			return;
		}

		this._talentType = nLobby.eTalentType.TALENT_A1;//每次进来默认显示A1
		this._prevTalentType = this._talentType;

		this._isBaseSelected = true;

		//基础天赋，不显示高亮按钮

		this.currentAndTotal.string = this._talentType + "/" + (nLobby.eTalentType.TALENT_B2 - nLobby.eTalentType.TALENT_A1 + 1);

		this.installBtn.node.active =  false;
		this.uninstallBtn.node.active = false;

		this.toLeftSwitchBtn.interactable = false;
		this.toRightSwitchBtn.interactable = true;

		this.removeAllTalent();

		let rt : UITransform = this.talentItemRoot.getComponent(UITransform)!;
		rt.setContentSize(rt.width,(nLobby.eTalentType.TALENT_B3 - nLobby.eTalentType.TALENT_A1 )*this.talentInteral);
		//根据_talentList 生成界面
		for(var i = nLobby.eTalentType.TALENT_A1;i < nLobby.eTalentType.TALENT_B3;i++){
			this._talentItemList.push(this.createTalentItem(this._talentList[i - 1].talentType,
				i - 1,
				this._talentList[i - 1].tname,
				this._talentList[i - 1].des,
				nLobby.eTalentSlotState.TALENT_INSTALLED));

		}

		this.onUpdateSelectTalent ();

	}
	//高级天赋
	public OnClickHighTalentBtn() : void{
		if(!this._isBaseSelected){
			return;
		}

		this._talentType = nLobby.eTalentType.TALENT_B3;//每次进来默认显示b3
		this._prevTalentType = this._talentType;
		this._canInstallId = -1;

		this._isBaseSelected = false;
		this.installBtn.node.active = false;
		this.uninstallBtn.node.active = false;

		this.toLeftSwitchBtn.interactable = false;
		this.toRightSwitchBtn.interactable = true;

		this.currentAndTotal.string = (this._talentType - nLobby.eTalentType.TALENT_B3 + 1) + "/" + (nLobby.eTalentType.TALENT_C1 - nLobby.eTalentType.TALENT_B3 + 1);

		if(!this._isBaseSelected && this.getIfSlotInstalled(this._talentType)){
			this.uninstallBtn.node.active =  true;
		}

		this.removeAllTalent ();

		let rt : UITransform = this.talentItemRoot.getComponent(UITransform)!;
		rt.setContentSize(rt.width,(nLobby.eTalentType.TALENT_C1 - nLobby.eTalentType.TALENT_B3 )*this.talentInteral);

		//_talentSlotList 生成界面
		for (var i = 0;i < this._talentSlotList.length;i++) {
			let ttp : nLobby.eTalentType = this._talentSlotList[i].talentType;
			let tname = "";
			let des = "";
			if (ttp != nLobby.eTalentType.TALENT_NONE) {
				tname = this._talentList[ttp - 1].tname;
				des = this._talentList[ttp - 1].des;
			}
			this._talentItemList.push(this.createTalentItem(ttp, this._talentSlotList[i].tid, tname,des,this._talentSlotList[i].btnState));

		}

		this.onUpdateSelectTalent ();
	}

	public OnClickBuyBtn(event : any,tid : string) : void{
		//0  增加金币/积分  1增加钻石

	}
	public OnClickBackBtn() : void{
		//切换到主大厅界面
		Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.SHOW_LOBBY_PANEL],
			LobbyEvent.eLobbyPanel.LOBBY_LOBBY_PANEL);
	}
	public OnClickInstallBtn(event : any,isInstall : string) : void{
		if (isInstall == "1") {
			//安装
			//装备当前选中的天赋
			if (this.getIfSlotInstalled(this._talentType)) {
				//不能装备已经装备的
				this.showDialog ("","【"+this._talentList[this._talentType - 1].tname + "】已经装备过了！");
			} else {
				this.installBtn.node.active = false;
				this.uninstallBtn.node.active = true;

				if (this._canInstallId == -1)
					return;

				if (this._talentSlotList[this._canInstallId].talentType == nLobby.eTalentType.TALENT_NONE
					&& this._talentSlotList [this._canInstallId].btnState == nLobby.eTalentSlotState.TALENT_CAN_INSTALL ) {


					let tst : ITalentSlot= this._talentSlotList[this._canInstallId];

					tst.talentType = this._talentType;
					tst.tid = this._canInstallId;
					tst.btnState = nLobby.eTalentSlotState.TALENT_INSTALLED;
					this._talentSlotList[this._canInstallId] = tst;

					this._talentItemList[this._canInstallId].updateTalentItem(
						this._talentType,
						this._canInstallId,
						this._talentList[this._talentType - 1].tname,
						this._talentList[this._talentType - 1].des,
						nLobby.eTalentSlotState.TALENT_INSTALLED,
						this.onTalentBtnClick.bind(this));

					this.saveTalentCfg(true);

					this.onUpdateTalentCost();
				}

				this._canInstallId = -1;
			}
		} else {
			//卸载
			for(var i = 0;i < this._talentSlotList.length;i++){
				if (this._talentSlotList[i].talentType == this._talentType
				   && this._talentSlotList[i].btnState == nLobby.eTalentSlotState.TALENT_INSTALLED) {
					//卸载这个天赋
					let tst : ITalentSlot = this._talentSlotList[i];
					tst.btnState = nLobby.eTalentSlotState.TALENT_CAN_INSTALL;
					tst.talentType = nLobby.eTalentType.TALENT_NONE;
					this._talentSlotList[i] = tst;

					this._talentItemList[this._talentSlotList[i].tid].updateTalentItem(
						nLobby.eTalentType.TALENT_NONE,
						i,
						"",
						"",
						nLobby.eTalentSlotState.TALENT_CAN_INSTALL,
						this.onTalentBtnClick.bind(this));

					this.installBtn.node.active = false;
					this.uninstallBtn.node.active = false;

					this.saveTalentCfg(true);

					this.onUpdateTalentCost();

					break;
				}
			}
		}
	}
	public OnClickTalentLockBtn(tid : number) : void{
		//开槽
		this._openSlotId = tid;
		//默认只能钻石开槽。如果需要别的，这里需要弹窗，并在选择后请求
		Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.REQ_OPEN_TALENTSLOT],
			ProtocolDefine.nLobby.nTalent.eOpenByType.OPEN_BY_DIAMOND);
	}
	public OnClickTalentCanInstallBtn(tid : number) : void{
		//装备当前选中的天赋
		if (this.getIfSlotInstalled(this._talentType)) {
			// 此处需要切换
			for (var i = nLobby.eTalentType.TALENT_B3; i <= nLobby.eTalentType.TALENT_C1; i++) {
				if (!this.getIfSlotInstalled(this._talentList[i - 1].talentType)) {

					//切换到这个
					this._talentType = this._talentList[i - 1].talentType;

					this.onUpdateSelectTalent();
					this.hightlightSelect();
					this.checkSwitchTalentBtn();

					this.installBtn.node.active = true;
					this.uninstallBtn.node.active = false;

					this._canInstallId = tid;

					break;
				}

			}
		} else {
			this.installBtn.node.active = true;
			this.uninstallBtn.node.active = false;
			this._canInstallId = tid;
			//此处最好对该按钮做一定的动画或者高亮操作
		}

	}
	public OnClickTalentHasInstallBtn(tid : number) : void{
		//显示已经装备的天赋
		this.installBtn.node.active = false;
		this.uninstallBtn.node.active = false;

		if(!this._isBaseSelected){
			this.uninstallBtn.node.active = true;
		}

		if (this._isBaseSelected) {
			this._talentType = this._talentList[tid].talentType;
		} else {
			this._talentType = this._talentSlotList[tid].talentType;
		}

		this.checkSwitchTalentBtn();

		this.onUpdateSelectTalent();
	}
	public OnClickHightlightBtn(index : number) : void{
		this._talentType =  (index + nLobby.eTalentType.TALENT_B3) as nLobby.eTalentType;
		this.onUpdateSelectTalent();
	}
	public OnClickSwitchTalentBtn(event : any,left : string) : void{

		if (left == "1") {
			if (this._isBaseSelected) {
				if (this._talentType == nLobby.eTalentType.TALENT_A1) {
					this.toLeftSwitchBtn.interactable = false;
					this.toRightSwitchBtn.interactable = true;
				} else {
					this._talentType = (this._talentType - 1) as nLobby.eTalentType;
					this.toLeftSwitchBtn.interactable = true;
					this.toRightSwitchBtn.interactable = true;
				}
			} else {
				//
				if (this._talentType == nLobby.eTalentType.TALENT_B3) {
					this.toLeftSwitchBtn.interactable = false;
					this.toRightSwitchBtn.interactable = true;
				} else {
					this._talentType = (this._talentType - 1) as nLobby.eTalentType;
					this.toLeftSwitchBtn.interactable = true;
					this.toRightSwitchBtn.interactable = true;
				}
			}
		} else {
			if (this._isBaseSelected) {
				if (this._talentType == nLobby.eTalentType.TALENT_B2) {
					this.toLeftSwitchBtn.interactable = true;
					this.toRightSwitchBtn.interactable = false;
				} else {
					this._talentType = (this._talentType + 1) as nLobby.eTalentType;
					this.toLeftSwitchBtn.interactable = true;
					this.toRightSwitchBtn.interactable = true;
				}
			} else {
				//
				if (this._talentType == nLobby.eTalentType.TALENT_C1) {
					this.toLeftSwitchBtn.interactable = true;
					this.toRightSwitchBtn.interactable = false;
				} else {
					this._talentType = (this._talentType + 1) as nLobby.eTalentType;
					this.toLeftSwitchBtn.interactable = true;
					this.toRightSwitchBtn.interactable = true;
				}
			}
		}

		this.installBtn.node.active = false;
		this.uninstallBtn.node.active =  false;

		if(!this._isBaseSelected){
			//this.uninstallBtn.node.active = true;//切换默认丢失焦点，不显示安装卸载
		}

		this.checkSwitchTalentBtn();
		this.onUpdateSelectTalent();
	}
	
	//--------------------------以下网络数据更新界面------------------------------
    public onUpdateUserInfo() : void{
		//假设这里传递了整个account信息，实际上没有必要，也可以另外定义，其他均为相同做法
		let self : nAccount.SelfData = nAccount.Account.getSelfData();

		// 刷新所有用户相关的信息
		//比如金币显示，昵称，头像等等
		this.userGold.string = ""+self.gold;
		this.userDiamond.string = ""+self.diamond;


		//需要处理槽数和目前可安装+已安装不相等的情况
		this.checkTalentSlotNum(self.talent);
		this.OnClickHighTalentBtn();
		this.onUpdateTalentCost();
	}
    public OnOpenTalentSlot(utfos : LobbyEvent.IUpdateTalentForOpenSlot) : void{

		if (utfos.ret == ProtocolDefine.nLobby.nTalent.eOpenTalentslotResultType.OPEN_SUCCESS) {
			//开槽成功
			nAccount.Account.setUserGold (utfos.gold);
			nAccount.Account.setUserDiamond (utfos.diamond);

			//开槽成功
			let tst : ITalentSlot = this._talentSlotList[this._openSlotId];
			tst.btnState = nLobby.eTalentSlotState.TALENT_CAN_INSTALL;
			this._talentSlotList[this._openSlotId] = tst;

			this.saveTalentCfg(false);
			//刷新界面数据
			this.userGold.string = "" + utfos.gold;
			this.userDiamond.string = "" + utfos.diamond;
			//utfos.currentTalentNum

			this._talentItemList[this._openSlotId].updateTalentItem(nLobby.eTalentType.TALENT_NONE,
				this._openSlotId,
				"",
				"",
				nLobby.eTalentSlotState.TALENT_CAN_INSTALL,
				this.onTalentBtnClick.bind(this));

			//此处失去选中焦点
			this.installBtn.node.active = false;
			this.uninstallBtn.node.active = false;

		}else if(utfos.ret== ProtocolDefine.nLobby.nTalent.eOpenTalentslotResultType.OPEN_FAIL_LESS_DIAMOND){
			this.showDialog ("温馨提示","开槽失败，您的晶核不足，请充值");
		}else if(utfos.ret== ProtocolDefine.nLobby.nTalent.eOpenTalentslotResultType.OPEN_FAIL_LESS_GOLG){
			this.showDialog ("温馨提示","开槽失败，您的金币不足，请充值");
		}else if(utfos.ret== ProtocolDefine.nLobby.nTalent.eOpenTalentslotResultType.OPEN_FAIL_MAX_SLOT){
			this.showDialog ("温馨提示","您的天赋槽已全部打开！");
		}
	}

	//----------------ui----------
	public onHideTalentPanel(hide : boolean){
		this.node.active =  !hide;
	}
	public onUpdateSelectTalent() : void{
		resources.load(CommonDefine.ResPath.TALENT_ICON_BTN + this._talentType + "/spriteFrame",
			SpriteFrame, (err, spriteFrame) => {
				this.currentTalentIcon.spriteFrame = spriteFrame!;
			//spriteFrame.addRef();
		});

		this.currentTalentName.string = this._talentList[this._talentType - 1].tname;
		this.currentTalentDes.string = "技能说明： "+this._talentList[this._talentType - 1].des;

		this.hightlightSelect();
	}
	public onUpdateTalentCost() : void{
		//BASE 固定显示
		this.removeAllTalentCost();

		let totalCost : number = 0;
		//基础天赋消耗
		let rt : UITransform = this.baseTalentCostInfoRoot.getComponent(UITransform)!;
		rt.setContentSize(rt.width,(nLobby.eTalentType.TALENT_B3 - nLobby.eTalentType.TALENT_A1 )*this.talentCostInteral);

		for(var i = nLobby.eTalentType.TALENT_A1;i <= nLobby.eTalentType.TALENT_B2;i++){
			this._talentCostItemList.push(this.createTalentCostItem(this.baseTalentCostInfoRoot,
				i as nLobby.eTalentType,
				i-1,
				this._talentList[i - 1].tname,
				this._talentList[i - 1].cost));
			totalCost += this._talentList[i - 1].cost;
		}

		//高级天赋消耗
		let rt2 : UITransform = this.highTalentCostInfoRoot.getComponent(UITransform)!;
		rt2.setContentSize(rt.width,(nLobby.eTalentType.TALENT_C1 - nLobby.eTalentType.TALENT_B3 )*this.talentCostInteral);

		let offset : number = 0;
		for (i = 0; i < this._talentSlotList.length; i++) {
			if (this._talentSlotList[i].btnState == nLobby.eTalentSlotState.TALENT_INSTALLED) {
				//
				this._talentCostItemList.push(this.createTalentCostItem(this.highTalentCostInfoRoot,
					this._talentSlotList[i].talentType,
					i - offset,
					this._talentList[this._talentSlotList[i].talentType - 1].tname,
					this._talentList[this._talentSlotList[i].talentType - 1].cost));
				
				totalCost += this._talentList[this._talentSlotList[i].talentType - 1].cost;
			} else {
				offset++;
			}
		}
		//总消耗数
		this.totalCost.string = "" + totalCost;
	}

	public removeAllTalent() : void{
		for (var i = 0; i < this._talentItemList.length; i++) {
			if (this._talentItemList[i] != null) {
				this._talentItemList[i].node.destroy();
			}
		}
		this._talentItemList = [];
	}

	public removeAllTalentCost() : void{
		for (var i = 0; i < this._talentCostItemList.length; i++) {
			if (this._talentCostItemList[i] != null) {
				this._talentCostItemList[i].node.destroy();
			}
		}
		this._talentCostItemList = [];
	}
	public createTalentItem(type : nLobby.eTalentType,tid : number,tname : string,
		des : string,btnState : nLobby.eTalentSlotState) :TalentItem{

		let n : Node = instantiate(this.talentPrefab);
		let talentItem : TalentItem = n.getComponent(TalentItem)!;
		talentItem.node.setParent(this.talentItemRoot);
		talentItem.node.setPosition(0,- tid * this.talentInteral - 90);//????
		talentItem.updateTalentItem (type,tid, tname,des,btnState,this.onTalentBtnClick.bind(this));

		//talentItem.node.setScale(); = talentItem.transform.localScale * CommonUtil.Util.getScreenScale();

		return talentItem;
	}

	public createTalentCostItem(root : Node,type : nLobby.eTalentType,tid : number,
		tname : string,cost : number) : TalentCostItem{

		let n : Node = instantiate(this.talentCostPrefab);
		let talentCostItem : TalentCostItem = n.getComponent(TalentCostItem)!;
		talentCostItem.node.setParent(root);
		talentCostItem.node.setPosition(0,- tid * this.talentCostInteral - 30);
		talentCostItem.updateTalentItem (type, tname,cost);
		
		return talentCostItem;
	}
	public hightlightSelect() : void{
		if (this._isBaseSelected) {
			this.currentAndTotal.string = "" + this._talentType + "/" + (nLobby.eTalentType.TALENT_B2 - nLobby.eTalentType.TALENT_A1 + 1);
		} else {
			this.currentAndTotal.string = "" + (this._talentType - nLobby.eTalentType.TALENT_B3 + 1) + "/" + (nLobby.eTalentType.TALENT_C1 - nLobby.eTalentType.TALENT_B3 + 1);
		}
	}
	public getIfSlotInstalled(ttp : nLobby.eTalentType) : boolean{
		for(var i = 0;i < this._talentSlotList.length;i++ ){
			if(this._talentSlotList[i].talentType == ttp ){
				if (this._talentSlotList[i].btnState == nLobby.eTalentSlotState.TALENT_INSTALLED) {
					return true;
				}
				return false;
			}
		}
		return false;
	}
	public checkSwitchTalentBtn() : void{

		this.toLeftSwitchBtn.interactable = true;
		this.toRightSwitchBtn.interactable = true;

		if (this._talentType == nLobby.eTalentType.TALENT_A1) {
			this.toLeftSwitchBtn.interactable = false;
		} else if (this._talentType == nLobby.eTalentType.TALENT_B3) {
			this.toLeftSwitchBtn.interactable = false;
		} else if (this._talentType == nLobby.eTalentType.TALENT_B2) {
			this.toRightSwitchBtn.interactable = false;
		} else if (this._talentType == nLobby.eTalentType.TALENT_C1) {
			this.toRightSwitchBtn.interactable = false;
		}
	}
	public checkTalentSlotNum(num : number){
		let cnt : number = 0;
		for(var i = 0;i< this._talentSlotList.length;i++){
			if(this._talentSlotList[i].btnState != nLobby.eTalentSlotState.TALENT_LOCK){
				cnt++;
			}
		}

		if (cnt == num)
			return;

		if (cnt < num) {
			//数据应该被清理了或者删除过应用
		}else{
			//这种出了异常问题，不是清理数据
		}

		cnt = num;

		//简单处理，全部重置，需要重新配置
		this._talentSlotList = [];
		for (i = nLobby.eTalentType.TALENT_B3; i <= nLobby.eTalentType.TALENT_C1; i++) {
			let btnState = nLobby.eTalentSlotState.TALENT_LOCK;
			if (cnt > 0) {
				btnState = nLobby.eTalentSlotState.TALENT_CAN_INSTALL;
				cnt--;
			} else {
				btnState = nLobby.eTalentSlotState.TALENT_LOCK;
			}

			let ts : ITalentSlot = {
				talentType : nLobby.eTalentType.TALENT_NONE,
				tid : i - nLobby.eTalentType.TALENT_B3,
				btnState : btnState
			};
			this._talentSlotList.push(ts);
		}
	}
	public onTalentBtnClick(btnState : nLobby.eTalentSlotState,tid : number) : void{
		switch(btnState){
			case nLobby.eTalentSlotState.TALENT_LOCK:
				this.OnClickTalentLockBtn(tid);
				break;
	
			case nLobby.eTalentSlotState.TALENT_CAN_INSTALL:
				this.OnClickTalentCanInstallBtn(tid);
				break;
	
			case nLobby.eTalentSlotState.TALENT_INSTALLED:
				this.OnClickTalentHasInstallBtn(tid);
				break;
		}
	}
	public loadTalentCfg() : void{
		this._isBaseSelected = true;
		//加载天赋配置文件
		resources.load('Config/TalentConfig',JsonAsset,(err,jsonAsset)=>{
            if(jsonAsset){
				let talentJsonCfg : any = {};
				talentJsonCfg = jsonAsset.json;
				this.initTalentConfig(talentJsonCfg);
				this.onUpdateUserInfo();
            }
		});
	}
	private initTalentConfig(talentJsonCfg : any){
		this._talentList = [];
		for(var i = nLobby.eTalentType.TALENT_A1;i <= nLobby.eTalentType.TALENT_C1;i++){
			if(talentJsonCfg[""+i] != undefined && talentJsonCfg[""+i] != null){	
				let td : ITalentData = {
					talentType : i as nLobby.eTalentType,
					cost : Number(talentJsonCfg[""+i]['cost']),
					des : talentJsonCfg[""+i]['des'],
					tname : talentJsonCfg[""+i]['name']
				};
				this._talentList.push(td);
			}
		}
		
		//加载配置信息
		this._talentSlotList = [];
		for (var i = nLobby.eTalentType.TALENT_B3; i <= nLobby.eTalentType.TALENT_C1; i++) {
			let ts : ITalentSlot = {
				talentType : nLobby.eTalentType.TALENT_NONE,
				tid : i - nLobby.eTalentType.TALENT_B3,
				btnState : nLobby.eTalentSlotState.TALENT_LOCK
			};
			this._talentSlotList.push(ts);
		}

		let btnStateStr : string = Utils.getPlayerPrefs(CommonDefine.CONST.TALENT_SLOT_STATE, "");
		if (btnStateStr != "") {
			let btnStates : Array<string> = btnStateStr.split(',');
			for(var st in btnStates) {
				let data : Array<string> = st.split('#');
				for(i = 0;i < this._talentSlotList.length;i++){
					if (this._talentSlotList[i].tid == Number(data[1])) {
						let tst : ITalentSlot = this._talentSlotList[i];
						tst.talentType = Number(data[0]) as nLobby.eTalentType;
						tst.btnState = Number(data[2]) as nLobby.eTalentSlotState;
						this._talentSlotList[i] = tst;
					}
				}
			}
		}
	}
	public saveTalentCfg(sholudRefreshUserTalent : boolean) : void{
		//"2#1#1,4#2#2,..."

		let cfg : string = "";
		for (var i = 0;i< this._talentSlotList.length;i++) {
			cfg = cfg + this._talentSlotList[i].talentType + "#" + this._talentSlotList[i].tid +"#"+ this._talentSlotList[i].btnState + ",";
		}

		if (cfg == "")
			return;
		
		cfg = cfg.substr(0,cfg.length - 1);

		Utils.setPlayerPrefs(CommonDefine.CONST.TALENT_SLOT_STATE,cfg);

		if (sholudRefreshUserTalent) {
			let tl : Array<nLobby.eTalentType> = [];

			for (var i = 0; i < this._talentSlotList.length; i++) {
				if (this._talentSlotList[i].btnState == nLobby.eTalentSlotState.TALENT_INSTALLED) {
					tl.push(this._talentSlotList[i].talentType);
				}
			}
			nAccount.Account.updateUserTalent (tl);
		}
	}
}
