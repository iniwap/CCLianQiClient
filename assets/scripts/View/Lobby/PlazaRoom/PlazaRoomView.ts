// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Node, Button, EditBox, Sprite, Label, Prefab, RichText, UITransform, instantiate, resources, SpriteFrame } from 'cc';
import { eDialogBtnType, eDialogEventType, IDialog } from '../../../Common/Dialog';
import { CommonDefine } from '../../../Define/CommonDefine';
import { ProtocolDefine } from '../../../Define/ProtocolDefine';
import { LobbyEvent } from '../../../Event/LobbyEvent';
import { RoomEvent } from '../../../Event/RoomEvent';
import { nLobby } from '../../../Model/Lobby';
import { nRoom } from '../../../Model/Room';
import { NetworkState } from '../../../Utils/NetworkState';
import { Utils } from '../../../Utils/Utils';
import { Plaza } from './Plaza';
import { RoomPlayer } from './RoomPlayer';
const { ccclass, property } = _decorator;

export enum ePlazaRoomPanelType{
	PLAZA_PANEL,
	CREATE_PANEL,
	ROOM_PANEL,
};

@ccclass('PlazaRoomView')
export class PlazaRoomView extends NetworkState {
	//#region 界面控件定义
	@property(Node)
	public createRoomPanel! : Node;
	@property(Node)
	public plazaPanel! : Node;
	@property(Node)
	public roomPanel! : Node;

	@property(Button)
	public createBtn! : Button;
	@property(Button)
	public joinBtn !: Button;

	@property(EditBox)
	public inputField! : EditBox;

	@property(Sprite)
	public roomTitleBg! : Sprite;

	@property(Label)
	public inputRoomID! : Label;

	@property(Label)
	public currentRoomID! : Label;

	@property(Prefab)
	public plazaPrefab! : Prefab;
	@property(Number)
	public plazaInteral : number = 0;

	@property(Prefab)
	public roomPlayerPrefab! : Prefab;

	@property(Node)
	public plazaRoot! : Node;

	@property(Sprite)
	public plazaLevel! : Sprite;

	@property(Label)
	public plazaLevelText! : Label;

	@property(Button)
	public switchPlazaLBtn! : Button;

	@property(Button)
	public switchPlazaRBtn! : Button;

	@property(RichText)
	public switchPlazaText! : RichText;

	@property(Button)
	public switchModeLBtn! : Button;

	@property(Button)
	public switchModeRBtn! : Button;

	@property(Label)
	public currentRoomModeText! : Label;

	@property(Number)
	public baseScoreList : Array<number> = [];

	private _currentPlazaLevel : nLobby.ePlazaLevelType = nLobby.ePlazaLevelType.PLAZA_LEVEL_MIDDLE;
	private _currentPlayerNum : number = 2;
	private _currentGridLevel : number = 4;

	@property(Button)
	public roomActionBtn! : Button;

	@property(Button)
	public roomShareOrJoinBtn! : Button ;//快速开始或者分享
	private _actionType : nRoom.eRoomActionType  = nRoom.eRoomActionType.CAN_CREATE_ROOM;


	@property(Label)
	public currentLmtRoundText! : Label;
	private _currentLmtRound : number = 100;//10回合增加/减少
	@property(Label)
	public currentLmtTurnTimeText! : Label ;
	private _currentLmtTurnTime : number = 20;//1秒增加减少

	@property(Button)
	public addLmtRoundBtn !: Button;
	@property(Button)
	public desLmtRoundBtn! : Button;
	@property(Button)
	public addLmtTurnTimeBtn! : Button;
	@property(Button)
	public desLmtTurnTimeBtn! : Button ;
	//正在房间中

	@property(Sprite)
	public inRoomLevel! : Sprite;

	@property(Label)
	public inRoomLevelText! : Label;

	@property(Label)
	public inRoomModel! : Label;

	@property(Label)
	public inRoomLmtRound! : Label;

	@property(Label)
	public inRoomLmtTurnTime!: Label;

	@property(Button)
	public readyBtn !: Button;

	@property(Button)
	public cancelReadyBtn! : Button;

	@property(Button)
	public startBtn! : Button;
	private _inRoomGridLevel : number = 4;

	@property(Node)
	public  roomPlayer : Array<Node> = [];
	private _realPlaza : Array<Plaza> = [];
	private _realPlayer : Array<RoomPlayer | null> = [null,null,null,null];
	//#endregion

    start () {
		// Your initialization goes here.
    }

    onEnable(){
		super.onEnable();
        Utils.getGlobalController()?.On(LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_PLAZA],
            this.OnUpdatePlaza.bind(this),this);
        Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_ROOMRULE],
			this.OnUpdateRoomRule.bind(this),this);
		Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_LEAVE_ROOM],
			this.OnUpdateLeaveRoom.bind(this),this);
		Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.PLAER_ENTER],
			this.OnPlayerEnter.bind(this),this);
		Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_PLAER_STATE],
			this.OnUpdatePlayerState.bind(this),this);
		Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_DISSOLVE_ROOM],
			this.OnUpdateDissolveRoom.bind(this),this);
		Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.SHOW_TALK_MSG],
			this.OnShowTalkMsg.bind(this),this);
			
        this.OnUpdatePlaza();// 打开界面时，主动显示
    }

    onDisable(){
		super.onDisable();
        Utils.getGlobalController()?.Off(LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_PLAZA],
            this.OnUpdatePlaza.bind(this),this);
        Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_ROOMRULE],
			this.OnUpdateRoomRule.bind(this),this);
		Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_LEAVE_ROOM],
			this.OnUpdateLeaveRoom.bind(this),this);
		Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.PLAER_ENTER],
			this.OnPlayerEnter.bind(this),this);
		Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_PLAER_STATE],
			this.OnUpdatePlayerState.bind(this),this);
		Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_DISSOLVE_ROOM],
			this.OnUpdateDissolveRoom.bind(this),this);
		Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.SHOW_TALK_MSG],
			this.OnShowTalkMsg.bind(this),this);
    }
    // update (deltaTime: number) {
    //     // Your update function goes here.
	// }
	
	//------------------------------以下界面事件-----------------------------------------------
	public OnClickBackBtn() : void{
		//  这个时候需要判断是处于什么情况，分别有，创建房间，离开房间，解散房间
		switch (this._actionType) {
		case nRoom.eRoomActionType.CAN_CREATE_ROOM://可以直接返回大厅
			Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.SHOW_LOBBY_PANEL],
				LobbyEvent.eLobbyPanel.LOBBY_LOBBY_PANEL);
			break;
		case nRoom.eRoomActionType.CAN_LEAVE_ROOM:
				let iDlg : IDialog = {
					type : eDialogEventType.BACK_DISSOLVE_ROOM,
					tip : "返回大厅将会退出房间，是否退出？",
					hasOk : true,
					okText : "退出",
					hasCancel : true,
					cancelText : "取消",
					hasClose : false,
					closeText : "",
					callBack : this.onClickDialogBtn.bind(this),
				};
				this.OnShowDialog(iDlg);
			break;
		case nRoom.eRoomActionType.CAN_DISSOLVE:
			//房主离开就是解散房间
			let iDlg2 : IDialog = {
				type : eDialogEventType.BACK_DISSOLVE_ROOM,
				tip : "返回大厅将会解散房间，是否解散？",
				hasOk : true,
				okText : "解散",
				hasCancel : true,
				cancelText : "取消",
				hasClose : false,
				closeText : "",
				callBack : this.onClickDialogBtn.bind(this),
			};
			this.OnShowDialog(iDlg2);
			break;
		}
	}
	public onClickDialogBtn(btnType : eDialogBtnType,eventType : eDialogEventType) : void{
		if (eventType == eDialogEventType.BACK_DISSOLVE_ROOM) {
			if (btnType == eDialogBtnType.DIALOG_BTN_OK) {
				this.OnClickTopCreateRoomBtn();
			}
		}
	}
	public OnClickShareBtn() : void{
		//mlink share room
	}

	//关闭创建房间弹窗
	public OnClickCloseCreateRoomPanelBtn() : void{
		this.showPanel(ePlazaRoomPanelType.PLAZA_PANEL);
	}
	public OnClickQuickStartBtn() : void{
		if (!this.plazaPanel.active) {
			this.OnClickShareBtn ();
			return;
		}

		//请输入房号

		if (this.currentRoomID.string != "房间ID:0") {
			//已经在房间中
			this.showDialog("系统提示","您已经在房间中，无法创建房间");
			return;
		}

		let roomID : number = Number(this.inputRoomID.string);
		if (roomID == 0) {
			//请输入房号
			this.showDialog("温馨提示","请输入房号");
			return;
		}
		if (this.inputRoomID.string.length != 6) {
			// 房间号不正确
			this.showDialog("温馨提示","请输入正确的房号");
			return;
		}
		let data : RoomEvent.JoinRoom = {
            playerNum : 0,
            gridLevel : 0,
            plazaID : 0,
            pwd : "",
            roomId : roomID,
            tagId : -1,
            plazaName : ""
        }

        Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.JOIN_ROOM],data);
	}
	public OnClickTopCreateRoomBtn() : void{

		if (!this.plazaPanel.active) {
			//  这个时候需要判断是处于什么情况，分别有，创建房间，离开房间，解散房间
			switch (this._actionType) {
			case nRoom.eRoomActionType.CAN_LEAVE_ROOM:
				//其他人离开就是普通离开房间
				Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.LEAVE_ROOM],false);

				break;
			case nRoom.eRoomActionType.CAN_DISSOLVE:
				//房主离开就是解散房间
				Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.LEAVE_ROOM],false);
				break;
			}
			return;
		}

		this.showPanel(ePlazaRoomPanelType.CREATE_PANEL);
	}
	public OnClickCreateRoomBtn() : void{
		let rule : nRoom.RoomRule = {
			playerNum : this._currentPlayerNum,
			gridLevel : this._currentGridLevel,
			rule : "default",
			gameTime : 0,
			lmtRound : this._currentLmtRound,
			lmtTurnTime : this._currentLmtTurnTime
		};

		let data : RoomEvent.IReqCreateRoom = {
			roomName : "",
			roomPassword : "",
			rule : JSON.stringify(rule),
			roomType : ProtocolDefine.nRoom.eCreateRoomType.ROOM_ROOM,
			minScore : this.baseScoreList[this._currentPlazaLevel - 1],
			maxScore : 0,
			baseScore :  this.baseScoreList[this._currentPlazaLevel - 1]
		}


		Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.CREATE_ROOM],data);
	}

	public OnClickSwitchPlazaLevelBtn(event : any,op : string) : void{
		//OP = 0 降低，1 升高
		if (op == "0") {
			let level : number = this._currentPlazaLevel;
			if (level == 1) {
				return;
			}
			this._currentPlazaLevel = (--level) as nLobby.ePlazaLevelType;
			if (this._currentPlazaLevel == nLobby.ePlazaLevelType.PLAZA_LEVEL_LOW) {
				this.switchPlazaLBtn.interactable = false;
			} else {
				this.switchPlazaLBtn.interactable = true;
			}
			this.switchPlazaRBtn.interactable = true;

		} else if (op == "1") {
			let level : number = this._currentPlazaLevel as number;
			if (level == 3) {
				return;
			}
			this._currentPlazaLevel = (++level) as nLobby.ePlazaLevelType;
			if (this._currentPlazaLevel == nLobby.ePlazaLevelType.PLAZA_LEVEL_HIGH) {
				this.switchPlazaRBtn.interactable = false;
			} else {
				this.switchPlazaRBtn.interactable = true;
			}
			this.switchPlazaLBtn.interactable = true;
		}
		resources.load(CommonDefine.ResPath.PLAZA_ROOM_LEVEL + this._currentPlazaLevel + "/spriteFrame",
			SpriteFrame, (err, spriteFrame) => {
			this.plazaLevel.spriteFrame = spriteFrame!;
			//spriteFrame.addRef();
		});

		this.plazaLevelText.string = "" + this.getBaseScore() + "\n积分";

		this.switchPlazaText.string = "创建该等级房间，需要消耗<color=#f03a13>"+this.getBaseScore() +"</color>积分";
	}

	public OnClickSwitchRoomModeBtn(event : any,op : string) : void{
		//OP = 0 降低，1 升高
		if (op == "0") {
			if (this._currentPlayerNum == 4 && this._currentGridLevel == 6) {
				this.switchModeLBtn.interactable = false;
				return;
			}

			if (this._currentPlayerNum == 2 && this._currentGridLevel == 4) {
				this._currentPlayerNum = 4;
				this._currentGridLevel = 6;
				this.switchModeLBtn.interactable = false;
			}else if (this._currentPlayerNum == 2 && this._currentGridLevel == 6) {
				this._currentPlayerNum = 2;
				this._currentGridLevel = 4;
			}
			this.switchModeRBtn.interactable = true;

		} else if (op == "1") {
			if (this._currentPlayerNum == 2 && this._currentGridLevel == 6) {
				this.switchModeRBtn.interactable = false;
				return;
			}

			if (this._currentPlayerNum == 2 && this._currentGridLevel == 4) {
				this._currentPlayerNum = 2;
				this._currentGridLevel = 6;
				this.switchModeRBtn.interactable = false;
			}else if (this._currentPlayerNum == 4 && this._currentGridLevel == 6) {
				this._currentPlayerNum = 2;
				this._currentGridLevel = 4;
			}

			this.switchModeLBtn.interactable = true;
		}

		this.currentRoomModeText.string = Utils.getModeStr(ProtocolDefine.nRoom.eCreateRoomType.ROOM_ROOM,
			this._currentPlayerNum,this._currentGridLevel);

	}

	public OnClickChangeLmtRound(event : any,add : string) : void{
		if (add == "1") {
			if (this._currentLmtRound < CommonDefine.CONST.MAX_LMT_ROUND) {
				this._currentLmtRound += 10;	
			}
		} else {
			if (this._currentLmtRound > CommonDefine.CONST.MIN_LMT_ROUND) {
				this._currentLmtRound -= 10;
			}
		}

		this.addLmtRoundBtn.interactable = true;
		this.desLmtRoundBtn.interactable = true;
		if(this._currentLmtRound >= CommonDefine.CONST.MAX_LMT_ROUND){
			this.addLmtRoundBtn.interactable = false;
		}
		if(this._currentLmtRound <= CommonDefine.CONST.MIN_LMT_ROUND){
			this.desLmtRoundBtn.interactable = false;
		}
		this.currentLmtRoundText.string = "" + this._currentLmtRound;
	}

	public OnClickChangeLmtTurnTime(event : any,add : string) : void{
		
		if (add == "1") {
			if (this._currentLmtTurnTime < CommonDefine.CONST.MAX_LMT_TURNTIME) {
				this._currentLmtTurnTime += 1;
			}
		} else {
			if (this._currentLmtTurnTime > CommonDefine.CONST.MIN_LMT_TURNTIME) {
				this._currentLmtTurnTime -= 1;
			}
		}

		this.addLmtTurnTimeBtn.interactable = true;
		this.desLmtTurnTimeBtn.interactable = true;
		if(this._currentLmtTurnTime >= CommonDefine.CONST.MAX_LMT_TURNTIME){
			this.addLmtTurnTimeBtn.interactable = false;
		}
		if(this._currentLmtTurnTime <= CommonDefine.CONST.MIN_LMT_TURNTIME){
			this.desLmtTurnTimeBtn.interactable = false;
		}
		this.currentLmtTurnTimeText.string = "" + this._currentLmtTurnTime;
	}

	public OnClickReady() : void{
		//点击准备
		Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.PLAYER_ACT],
			ProtocolDefine.nRoom.eActType.ACT_READY);
		this.readyBtn.interactable = false;
	}

	//房主开始游戏
	public OnClickStart() : void{
		//
		this.startBtn.interactable = false;
		Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.START_GAME],false);
	}

	public OnClickGetRoomList(){
		Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.GET_ROOM_LIST],0,10);
	}
	//---------------网络消息-------------------
    private OnUpdatePlaza() : void{
		let plazaList : Array<nLobby.Plaza> = [];
		for (var i = 0; i < nLobby.Lobby.plazaList.length; i++) {
			if(nLobby.Lobby.plazaList[i].roomType == ProtocolDefine.nRoom.eCreateRoomType.ROOM_PLAZA){
				plazaList.push(nLobby.Lobby.plazaList[i]);
			}
        }
		
		let content : UITransform = this.plazaRoot.getComponent(UITransform)!;
		if(content) content.setContentSize(plazaList.length*this.plazaInteral,content.height);

		this.removeAllPlaza();

		for(var i = 0;i< plazaList.length;i++){
			this._realPlaza.push(this.createPlaza(i,plazaList[i]));
		}
    }
	public OnUpdateRoomRule(roomRule : RoomEvent.IUpdateRoomRule){
		this.updateRoomInfo(true);

		resources.load(CommonDefine.ResPath.PLAZA_ROOM_LEVEL + roomRule.roomLevel + "/spriteFrame",
			SpriteFrame, (err, spriteFrame) => {
            this.inRoomLevel.spriteFrame = spriteFrame!;
            //spriteFrame.addRef();
        });

		this.inRoomLevelText.string = "" + this.getBaseScore() + "积分";

		let model : string = "";//CommonUtil.Util.getModeStr(roomRule.playerNum,roomRule.gridLevel);

		if (roomRule.playerNum == 2) {
			model = model + "双人";
		}else if(roomRule.playerNum == 3){
			model = model + "三人";
		}else if(roomRule.playerNum == 4){
			model = model + "四人";
		}
		if (roomRule.gridLevel == 4) {
			model = model + "四阶";
		}else if(roomRule.gridLevel == 6){
			model = model + "六阶";
		}else if(roomRule.gridLevel == 8){
			model = model + "八阶";
		}

		this.inRoomModel.string = model;
		this.inRoomLmtRound.string = ""+roomRule.lmtRound;
		this.inRoomLmtTurnTime.string = "" + roomRule.lmtTurnTime;

		this._inRoomGridLevel = roomRule.gridLevel;

		this.currentRoomID.string = "房间ID:"+roomRule.roomID;

		//创建房间成功
		this.showPanel(ePlazaRoomPanelType.ROOM_PANEL);
	}

	public OnUpdateLeaveRoom(local : number){

		this.showWaitImg(true,local);
		//REMOVE PLAERY
		this._realPlayer[local]?.node.destroy();
		this._realPlayer[local] = null;

		//此时按钮状态需要修改
		if(this.startBtn.interactable) this.startBtn.interactable = false;
	}
	public OnPlayerEnter(player : nRoom.Player){
		let local : number = nRoom.Room.getLocalBySeat(player.seat) ;

		//这种算法只适合上下左右布局的座位排布，不适合直线排布的，需要优化 //实际上，直线排列简单很多
		if(this._realPlayer[local] != null) this._realPlayer[local]?.node.destroy();//首先需要释放

		this._realPlayer[local] = this.createPlayer(player);

		this.showWaitImg(false,local);

		if (local == nRoom.eSeatType.SELF) {
			if (player.isOwner) {
				this.updateRoomActionType(nRoom.eRoomActionType.CAN_DISSOLVE);
			} else {
				this.updateRoomActionType(nRoom.eRoomActionType.CAN_LEAVE_ROOM);
			}

			for (var i = 0; i < this._inRoomGridLevel; i++) {
				this.showWaitImg(true, nRoom.Room.getLocalBySeat(i));
			}
		}
	}

	public OnUpdatePlayerState(ps : RoomEvent.IUpdatePlayerState): void {
		if (ps.state == ProtocolDefine.nRoom.eStateType.STATE_TYPE_ROOMREADY &&
		    ps.local == nRoom.eSeatType.SELF) {
			this.readyBtn.node.active = false;

			//只有owner的才能设置显示开局按钮
			if (this._realPlayer[ps.local]?.getIsOwner()) {
				this.startBtn.node.active =  true;
			} else {
				this.cancelReadyBtn.node.active = true;
				this.cancelReadyBtn.interactable = false;//暂时不支持取消准备
			}

			this.startBtn.interactable = false;
		}

		if (ps.state == ProtocolDefine.nRoom.eStateType.STATE_TYPE_ROOMREADY){
			this._realPlayer[ps.local]!.updatePlayerReady();
		}

		if (ps.ifAllReady) {
			if (this._realPlayer[nRoom.eSeatType.SELF]?.getIsOwner()) {
				this.startBtn.interactable = true;
			}
		}
	}
	public OnUpdateDissolveRoom() : void{
		//房间解散，切回到创建面板
		this.updateRoomInfo(false);

		this.updateRoomActionType(nRoom.eRoomActionType.CAN_CREATE_ROOM);

		//隐藏全部
		for (var i = 0; i < 4; i++) {
			this.showWaitImg (false, i);
			if (this._realPlayer[i] != null) {
				this._realPlayer[i]?.node.destroy();
				this._realPlayer[i] = null;
			}
		}
		this.currentRoomID.string = "房间ID:0";

		this.showPanel(ePlazaRoomPanelType.PLAZA_PANEL);
	}
	public OnShowTalkMsg(local : number,content : string) : void{

	}
    //--------------子界面处理---------------------
	public OnUnselectPlazaExcept(plazaId : number) : void{
		let plazas : Array<Plaza> = this.plazaRoot.getComponentsInChildren(Plaza);
		for(var i = 0;i < plazas.length;i++){
			if (plazas[i].getID() != plazaId) {
				plazas[i].unselectPlaza();
			}
		}
    }
    
    public onClickJoinRoom(playerNum : number,gridLevel : number,plazaID : number,name :string,tag : number) : void{
		if (playerNum == 0) {
            //提示请选择人数和阶数
            this.showDialog("","请先选择对局人数以及阶数");
			return;
		}
        
        let data : RoomEvent.JoinRoom = {
            playerNum : playerNum,
            gridLevel : gridLevel,
            plazaID : plazaID,
            pwd : "",
            roomId : 0,
            tagId : tag,
            plazaName : name
        }

        Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.JOIN_ROOM],data);
	}

	//------------内部接口--------------
	public removeAllPlaza() : void{
		for (var i = 0; i < this._realPlaza.length; i++) {
			if (this._realPlaza[i] != null /*&& this._realPlaza[i].isValid*/) {
				this._realPlaza[i].node.destroy();
			}
			//this._realPlaza[i].node = null;
		}

		this._realPlaza = [];
	}
	public createPlaza(index : number,data : nLobby.Plaza) : Plaza{

		let n : Node = instantiate(this.plazaPrefab);
		let plazaItem : Plaza = n.getComponent(Plaza)!;

		plazaItem.node.setParent(this.plazaRoot);

		plazaItem.node.setPosition(index*this.plazaInteral + this.plazaInteral/2,0);

		let roomRule : nRoom.RoomRule = JSON.parse(data.rule);

		let rr : string = "";
		if(roomRule.lmtRound != 0){
			rr = "回合限制"+roomRule.lmtRound;
		}else{
			rr = "回合无限制";
		}

		if (roomRule.lmtTurnTime != 0) {
			rr = rr + " 思考时间"+roomRule.lmtTurnTime+"秒";
		} else {
			rr = rr + " 思考时间无限制";
		}

		plazaItem.updatePlaza(index,data.plazaid,data.name,data.star,data.des,rr,
			this.OnUnselectPlazaExcept.bind(this),
			this.onClickJoinRoom.bind(this));

		//plazaItem.node.setScale(plazaItem.node.scale * CommonUtil.Util.getScreenScale();

		return plazaItem;
	}
	public updateRoomInfo(ifInRoom : boolean) : void{
		if (ifInRoom) {
			this.readyBtn.node.active = true;
			this.cancelReadyBtn.node.active = false;
			this.startBtn.node.active = false;

			this.readyBtn.interactable = true;
			this.cancelReadyBtn.interactable = false;

			this.enbaleAllPlaza(false);

		} else {
			this.enbaleAllPlaza(true);
		}
	}
	//显隐界面
	public onHidePlazaRoomPanel(hide : boolean) : void{
		this.node.active = !hide;
		if (hide) {
			for (var i = 0; i < this._realPlaza.length; i++) {
				this._realPlaza[i].node.destroy();
			}

			this._realPlaza = [];
		}
	}
	public enbaleAllPlaza(enable : boolean) : void{
		let pls : Array<Plaza> = this.plazaRoot.getComponentsInChildren(Plaza);
		for (var i = 0; i < pls.length; i++) {
			pls[i].enablePlaza(enable);
		}
	}
	public getBaseScore() : number{
		let baseScore : number = 50;
		if (this._currentPlazaLevel == nLobby.ePlazaLevelType.PLAZA_LEVEL_LOW) {
			baseScore = 50;
		}else if(this._currentPlazaLevel == nLobby.ePlazaLevelType.PLAZA_LEVEL_MIDDLE){
			baseScore = 500;
		}else if(this._currentPlazaLevel == nLobby.ePlazaLevelType.PLAZA_LEVEL_HIGH){
			baseScore = 5000;
		}

		return baseScore;
	}
	private showPanel(type : ePlazaRoomPanelType) : void{
		switch(type){
		case  ePlazaRoomPanelType.CREATE_PANEL:
			this.createRoomPanel.active = true;
			this.plazaPanel.active = false;
			this.roomPanel.active = false;

			this.inputField.node.active = false;
			this.roomTitleBg.node.active = false;

			break;
		case ePlazaRoomPanelType.PLAZA_PANEL:
			this.createRoomPanel.active = false;
			this.plazaPanel.active = true;
			this.roomPanel.active = false;

			this.inputField.node.active = true;
			this.roomTitleBg.node.active = false;
			break;
		case ePlazaRoomPanelType.ROOM_PANEL:
			this.createRoomPanel.active = false;
			this.plazaPanel.active  = false;
			this.roomPanel.active  = true;

			this.inputField.node.active = false;
			this.roomTitleBg.node.active = true;
			break;
		}
	}
	public  showWaitImg(show : boolean,local : number) : void{
		this.roomPlayer[local].getChildByName("RoomWaitImg")!.active = show;
	}
	public createPlayer(data : nRoom.Player ) : RoomPlayer{

		let local : number = nRoom.Room.getLocalBySeat(data.seat);

		let n : Node = instantiate(this.roomPlayerPrefab);
		let player : RoomPlayer = n.getComponent(RoomPlayer)!;

		player.node.setParent(this.roomPlayer[local]);

		let total : number = data.win + data.lose + data.draw;
		let winRate : number = 0.0;
		if (total != 0) {
			winRate = 100 * 1.0 * data.win / (data.win + data.lose + data.draw);
		}
		player.updateRoomPlayer(nRoom.eRoomPlayerType.ROOM_WIAT,
			local,data.vip,winRate,data.head,data.isOwner,data.name);

		player.node.setPosition(0,0);

		//player.node.setScale(player.node.scale * Utils.getScreenScale());

		return player;
	}
	// 当前能执行的操作类型，分别有，可以创建房间，可以离开房间，可以解散房间
	public updateRoomActionType(type : nRoom.eRoomActionType) : void{
		this._actionType = type;

		switch (type) {
		case nRoom.eRoomActionType.CAN_CREATE_ROOM:
			this.roomActionBtn.getComponentInChildren(Label)!.string = "创建房间";
			this.roomShareOrJoinBtn.getComponentInChildren(Label)!.string = "加入房间";
			break;
		case nRoom.eRoomActionType.CAN_LEAVE_ROOM:
			this.roomActionBtn.getComponentInChildren(Label)!.string = "离开房间";
			this.roomShareOrJoinBtn.getComponentInChildren(Label)!.string = "分享房间";
			break;
		case nRoom.eRoomActionType.CAN_DISSOLVE:
			this.roomActionBtn.getComponentInChildren(Label)!.string= "解散房间";
			this.roomShareOrJoinBtn.getComponentInChildren(Label)!.string= "分享房间";
			break;
		case nRoom.eRoomActionType.CAN_NONE:
			//此时隐藏
			break;
		}
	}
}
