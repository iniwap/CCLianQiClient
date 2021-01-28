//
//房间相关，为了分散globalctrl的代码
//

import { director } from "cc";
import { eDialogEventType, IDialog } from "../Common/Dialog";
import { CommonDefine } from "../Define/CommonDefine";
import { ProtocolDefine } from "../Define/ProtocolDefine";
import { CommonEvent } from "../Event/CommonEvent";
import { LobbyEvent } from "../Event/LobbyEvent";
import { RoomEvent } from "../Event/RoomEvent";
import { nAccount } from "../Model/Account";
import { nLobby } from "../Model/Lobby";
import { nRoom } from "../Model/Room";
import { ProtocolManager } from "../ProtocolManager/ProtocolManager";
import { Utils } from "../Utils/Utils";

export class RoomController{
    public static _instance : RoomController;
    constructor() {

    }

    public static getInstance() : RoomController{
        if(this._instance == null){
            this._instance = new RoomController();
        }
        return this._instance;
    }

    public AddAllEvent() : void{
		/// reqJoinRoom->respJoinRoom->playerEnter->reqPlayerAct(非自动准备情况)->respPlayerAct/OnPlayerState->start->leave
		ProtocolManager.getInstance().On(ProtocolDefine.GameProtocol.P_GAME_PLAYER_INFO,
			this.OnPlayerEnter.bind(this));//玩家进入房间
		ProtocolManager.getInstance().On(ProtocolDefine.GameProtocol.P_GAME_PLAYER_STATE,
			this.OnPlayerState.bind(this));//玩家准备等
		ProtocolManager.getInstance().On(ProtocolDefine.GameProtocol.P_GAME_PLAYER_TALK_MSG,
			this.OnPlayerTalk.bind(this));//玩家聊天
		ProtocolManager.getInstance().On(ProtocolDefine.GameProtocol.P_GAME_PLAYER_LEAVE,
			this.OnPlayerLeave.bind(this));//玩家离开房间
		ProtocolManager.getInstance().On(ProtocolDefine.GameProtocol.P_GAME_CLOCK,
			this.OnPlayerClock.bind(this));//玩家步骤剩余时间
		ProtocolManager.getInstance().On(ProtocolDefine.GameProtocol.P_GAME_TALENT_LIST,
			this.OnTalentList.bind(this));//收到天赋列表

		ProtocolManager.getInstance().On(ProtocolDefine.GameProtocol.P_GAME_ROOMSTATE_CHANGE,
			this.OnRoomStateChange.bind(this));//房间状态变化
		ProtocolManager.getInstance().On(ProtocolDefine.GameProtocol.P_GAME_START_GAME,
			this.OnGameStart.bind(this));//收到游戏开始通知


		Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.CREATE_ROOM],
			this.onEventCreateRoom.bind(this),RoomController);
		Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.JOIN_ROOM],
			this.onEventJoinRoom.bind(this),RoomController);
		Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.GET_ROOM_LIST],
			this.onEventGetRoomList.bind(this),RoomController);
		Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.LEAVE_ROOM],
			this.onEventLeaveRoom.bind(this),RoomController);
		Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.PLAYER_ACT],
			this.onEventPlayerAct.bind(this),RoomController);
		Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.SHOW_ROOM_LIST],
			this.onEventShowRoomList.bind(this),RoomController);//界面自己请求房间列表数据，即该界面显示的时候invoke
		Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.START_GAME],
			this.onEventStartGame.bind(this),RoomController);

		Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.ENTER_ROOM_FINISH],
			this.onEnterRoomFinish.bind(this),RoomController);
		Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.TALK_MSG],
			this.onEventPlayerTalk.bind(this),RoomController);
    }
    public RemoveAllEvent() : void{
		ProtocolManager.getInstance().Off(ProtocolDefine.GameProtocol.P_GAME_PLAYER_INFO,
			this.OnPlayerEnter.bind(this));//玩家进入房间
		ProtocolManager.getInstance().Off(ProtocolDefine.GameProtocol.P_GAME_PLAYER_STATE,
			this.OnPlayerState.bind(this));//玩家准备等
		ProtocolManager.getInstance().Off(ProtocolDefine.GameProtocol.P_GAME_PLAYER_TALK_MSG,
			this.OnPlayerTalk.bind(this));//玩家聊天
		ProtocolManager.getInstance().Off(ProtocolDefine.GameProtocol.P_GAME_PLAYER_LEAVE,
			this.OnPlayerLeave.bind(this));//玩家离开房间
		ProtocolManager.getInstance().Off(ProtocolDefine.GameProtocol.P_GAME_CLOCK,
			this.OnPlayerClock.bind(this));//玩家步骤剩余时间
		ProtocolManager.getInstance().Off(ProtocolDefine.GameProtocol.P_GAME_TALENT_LIST,
			this.OnTalentList.bind(this));//收到天赋列表

		ProtocolManager.getInstance().Off(ProtocolDefine.GameProtocol.P_GAME_ROOMSTATE_CHANGE,
			this.OnRoomStateChange.bind(this));//房间状态变化
		ProtocolManager.getInstance().Off(ProtocolDefine.GameProtocol.P_GAME_START_GAME,
			this.OnGameStart.bind(this));//收到游戏开始通知


		Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.CREATE_ROOM],
			this.onEventCreateRoom.bind(this),RoomController);
		Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.JOIN_ROOM],
			this.onEventJoinRoom.bind(this),RoomController);
		Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.GET_ROOM_LIST],
			this.onEventGetRoomList.bind(this),RoomController);
		Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.LEAVE_ROOM],
			this.onEventLeaveRoom.bind(this),RoomController);
		Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.PLAYER_ACT],
			this.onEventPlayerAct.bind(this),RoomController);
		Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.SHOW_ROOM_LIST],
			this.onEventShowRoomList.bind(this),RoomController);//界面自己请求房间列表数据，即该界面显示的时候invoke
		Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.START_GAME],
			this.onEventStartGame.bind(this),RoomController);

		Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.ENTER_ROOM_FINISH],
			this.onEnterRoomFinish.bind(this),RoomController);
		Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.TALK_MSG],
			this.onEventPlayerTalk.bind(this),RoomController);
	}
    private showLoading(show : boolean) : void{
        Utils.getGlobalController()?.Emit(CommonEvent.EVENT[CommonEvent.EVENT.SHOW_LOADING],show);
    }
	//------------------------界面消息事件-----------------------------
	public onEventCreateRoom(Room : RoomEvent.IReqCreateRoom) : void{
		
		let cr : ProtocolDefine.nRoom.msgReqCreateRoom = {
			game :  ProtocolDefine.GameType.GAME_LIANQI,
			roomType : Room.roomType,
			baseScore : Room.baseScore,
			minScore : Room.minScore,
			maxScore : Room.maxScore,
			roomName : nAccount.Account.getSelfData().name,
			roomPassword : Room.roomPassword,
			rule : Room.rule
		};

		ProtocolManager.getInstance().SendMsg(ProtocolDefine.GameProtocol.P_GAME_REQ_CREATEROOM,
			Utils.encodeMsg(cr),
			this.OnRespCreateRoom.bind(this));

		this.showLoading(true);
	}
	
    public onEventJoinRoom(data : RoomEvent.JoinRoom) : void{

		let jr : ProtocolDefine.nRoom.msgReqJoinRoom = {
			game  : ProtocolDefine.GameType.GAME_LIANQI,
			playerNum : data.playerNum,
			gridLevel : data.gridLevel,
			pwd : data.pwd,//非用户创建无密码
			plazaID : data.plazaID,//根据plazalist得到，界面也是根据plazalisy生成
			roomId : data.roomId//非用户创建房间填0，即通过各种模式直接进入游戏的
		}
		//如果plazaid和roomid同时为0 则认为是经典快速开始模式
		if(data.plazaID == 0 && data.roomId == 0){
			//需要从plazalist查找plazaid
			for (var i = 0; i < nLobby.Lobby.plazaList.length; i++) {
				let roomRule : nRoom.RoomRule = JSON.parse(nLobby.Lobby.plazaList[i].rule);

				if(nLobby.Lobby.plazaList[i].roomType ==  ProtocolDefine.nRoom.eCreateRoomType.ROOM_CLASSIC_PLAZA
					&& roomRule.playerNum == data.playerNum
					&& roomRule.gridLevel == data.gridLevel){
					jr.plazaID = nLobby.Lobby.plazaList[i].plazaid;
					jr.roomId = 0;
				}
			}
		}
		//保存下如果是场模式的信息
		nRoom.Room.setPlazaData(data.plazaName,data.tagId);

		ProtocolManager.getInstance().SendMsg(ProtocolDefine.GameProtocol.P_GAME_REQ_JOINROOM,
			Utils.encodeMsg(jr),this.OnRespJoinRoom.bind(this));

		//哪里请求，哪里显示 - 可能效果更好
		this.showLoading(true);
	}

	public onEventLeaveRoom(mustLeave : boolean) : void{
		if (mustLeave) {
			// 这种是游戏结束的时候的离开
			nRoom.Room.reset ();
			director.loadScene(CommonDefine.eSceneType[CommonDefine.eSceneType.Lobby],(err, scene)=>{});
		} else {
			let lr : ProtocolDefine.nRoom.msgReqLeaveRoom = {game : ProtocolDefine.GameType.GAME_LIANQI};
			ProtocolManager.getInstance ().SendMsg(ProtocolDefine.GameProtocol.P_GAME_REQ_LEAVEROOM, Utils.encodeMsg(lr), 
				this.OnRespLeaveRoom.bind(this));
		}
	}
	public onEventStartGame(isEnterRoomFinsh : boolean) : void{
		//只有创建房间模式才有主动触发
		if (nRoom.Room.roomType == ProtocolDefine.nRoom.eCreateRoomType.ROOM_CLASSIC_PLAZA
			||nRoom.Room.roomType == ProtocolDefine.nRoom.eCreateRoomType.ROOM_PLAZA){
				return;
		}
		if(!nRoom.Room.getIfAllPlayerReady()) return;// 这种是错误情况，所有人准备了才能开始启动
		//此时可以启动游戏开始
		//房主点击开始，启动游戏场景
		director.loadScene(CommonDefine.eSceneType[CommonDefine.eSceneType.Game],(err, scene)=>{
			//启动游戏界面，重连不需要进入游戏等待匹配界面
		});
	}
	public onEnterRoomFinish() : void{
		//刷新房间规则显示
		let star : number = 0;
		if (nRoom.Room.plazaid != 0) {
			star = nLobby.Lobby.getPlazaById(nRoom.Room.plazaid)?.star!;
		}
		let rr : RoomEvent.IUpdateRoomRule = { 
			playerNum : nRoom.Room.roomRule.playerNum,
			gameTime : nRoom.Room.roomRule.gameTime,
			gridLevel : nRoom.Room.roomRule.gridLevel,
			rule : nRoom.Room.roomRule.rule,
			lmtRound : nRoom.Room.roomRule.lmtRound,
			lmtTurnTime : nRoom.Room.roomRule.lmtTurnTime,
			roomLevel : nRoom.Room.roomLevel,
			roomID : 0,
			plazaName : nRoom.Room.plazaName,
			tag : nRoom.Room.tagId,
			type : nRoom.Room.roomType,
			star :star
		}

		Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_ROOMRULE],rr);

		if (nRoom.Room.roomType == ProtocolDefine.nRoom.eCreateRoomType.ROOM_CLASSIC_PLAZA
			||nRoom.Room.roomType == ProtocolDefine.nRoom.eCreateRoomType.ROOM_PLAZA
			|| nRoom.Room.isRelink) {
			//完全进入游戏界面后，需要通知服务器可以发用户enter信息了,原则上来说，需要界面真正加载完成后再发,这里暂时直接发送
			let efmsg : ProtocolDefine.nRoom.msgNotifyEnterRoomFinish = {
				isRelink : nRoom.Room.isRelink
			}
			ProtocolManager.getInstance().SendMsg(ProtocolDefine.GameProtocol.P_GAME_ENTER_ROOM_FINISH, 
				Utils.encodeMsg(efmsg));
		} else {
			// 因为房间和组队模式，用户相关信息已经下发，所以需要手动驱动相关消息刷新游戏界面
			for(var i = 0;i < nRoom.Room.playerList.length;i++){
				/////////////////////////////enter/////////////////////////////////
				Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.PLAER_ENTER],
					nRoom.Room.playerList[i]);
				///////////////////////state/////////////////////////////////
				let ps : RoomEvent.IUpdatePlayerState = {
					state : nRoom.Room.playerList[i].state,
					local : nRoom.Room.getLocalBySeat(nRoom.Room.playerList[i].seat),
					ifAllReady : true
				}
				Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_PLAER_STATE],ps);
			}
		}
	}
	public onEventGetRoomList(currentPage : number,perCnt : number){
		let self : nAccount.SelfData = nAccount.Account.getSelfData();
		let rl : ProtocolDefine.nRoom.msgReqRoomList = {
			areaID :  self.area,
			//原则上来说，以后这两个数据需要传过来
			begin : currentPage * perCnt,
			reqCnt : perCnt,//所有
			game : ProtocolDefine.GameType.GAME_LIANQI
		}
		ProtocolManager.getInstance().SendMsg(ProtocolDefine.GameProtocol.P_GAME_REQ_ROOMLIST,
			Utils.encodeMsg(rl),this.OnRespRoomList.bind(this));

		this.showLoading(true);
	}
	public onEventShowRoomList(){
		Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.SHOW_ROOM_LIST],
			nRoom.Room.roomList);
	}
	//用户点击准备或者自动准备
	public onEventPlayerAct(act : ProtocolDefine.nRoom.eActType.ACT_READY){
		let player : nRoom.Player | null = nRoom.Room.getPlayerBySeat(nRoom.Room.selfSeat);
		if(player == null) return;
		if (player.talentList.length == 0 
			&& nRoom.Room.roomType == ProtocolDefine.nRoom.eCreateRoomType.ROOM_ROOM /*只有房间模式才提示*/) {
			//天赋未配置，作出提示，这里可以直接到请求准备到时候提示
			this.showDialog("您未配置天赋，请配置后再准备");
			return;
		}

		let pa : ProtocolDefine.nRoom.msgPlayerAct = {
			act : act,
			seat : nRoom.Room.selfSeat
		}

		ProtocolManager.getInstance().SendMsg(ProtocolDefine.GameProtocol.P_GAME_PLAYER_ACT,
			Utils.encodeMsg(pa),this.OnRespPlayerAct.bind(this));
	}
	public onEventReportTalent(ptl : RoomEvent.IPlayerTalentList){
		let talentList : string = "";
		for(var i = 0 ;i < ptl.talentList.length;i++){
			if (i < ptl.talentList.length - 1) {
				talentList += ptl.talentList[i] + ",";
			} else {
				talentList += ptl.talentList[i];
			}
		}
		if (ptl.talentList.length == 0) {
			talentList = "0,0,0,0";
		}

		let ot : ProtocolDefine.nLobby.nTalent.msgTalentList = {
			seat : nRoom.Room.selfSeat,
			talentList : talentList,
		}

		ProtocolManager.getInstance().SendMsg(ProtocolDefine.GameProtocol.P_GAME_REPORT_TALENT_LIST,
			Utils.encodeMsg(ot),this.OnTalentList.bind(this));
	}
	public onEventPlayerTalk(content : string){
		let pk : ProtocolDefine.nRoom.msgPlayerTalkMsg = {
			flag : ProtocolDefine.eFlag.SUCCESS,
			seat : nRoom.Room.selfSeat,
			content : content
		}

		ProtocolManager.getInstance().SendMsg(ProtocolDefine.GameProtocol.P_GAME_PLAYER_TALK_MSG,
			Utils.encodeMsg(pk),this.OnRespPlayerTalkMsg.bind(this));
	}

	//---------------------网络消息----------------------
	public OnTalentList(msg : any){
		let resp : ProtocolDefine.nLobby.nTalent.msgTalentList = msg;
		if (resp.seat == nRoom.Room.selfSeat) {
			//自己的天赋列表，原则上可以不用刷新了，因为本地知道

			//可刷新缓存，也可以不刷新
		} else {
			//别人的天赋列表，刷新别人天赋列表，并记录
			let player : nRoom.Player | null = nRoom.Room.getPlayerBySeat(resp.seat);
			if(player == null) return;
			player.talentList = [];
			let tl : Array<string> = resp.talentList.split(',');

			for(var i = 0;i < tl.length;i++){
				player.talentList.push(Number(tl[i]) as nLobby.eTalentType);
			}
		}
		//刷新天赋显示界面
	}
	public OnRespCreateRoom(msg : any) : void
	{
		this.showLoading(false);

		let resp : ProtocolDefine.nRoom.msgRespCreateRoom = msg;

		if (resp.flag == 0) {
			let roomRule : nRoom.RoomRule = JSON.parse(resp.rule);
			let data : RoomEvent.JoinRoom = {
				playerNum : roomRule.playerNum,
				gridLevel : roomRule.gridLevel,
				plazaID : 0,
				pwd : resp.roomPassword,
				roomId : resp.roomId,
				plazaName : "",
				tagId : -1
			};

			this.onEventJoinRoom(data);

		} else {
			this.showDialog("创建房间失败，参数有误或不满足开房条件");
		}
	}

	public OnRespJoinRoom(msg : any) : void{
		this.showLoading(false);

		let resp : ProtocolDefine.nRoom.msgRespJoinRoom = msg;
		//此处需要根据各种响应值，来给出友好提示
		let tip : string = "加入房间失败";
        if(resp.flag == ProtocolDefine.nRoom.eRespJoinRoomFlag.JOINROOM_SUCCESS
			|| resp.flag == ProtocolDefine.nRoom.eRespJoinRoomFlag.JOINGROOM_ALREADY_IN_ROOM){

			//规则应该一定不会为空的
			if(resp.rule == null || resp.rule.length == 0){
				//
				return;
			}

			if (resp.flag == ProtocolDefine.nRoom.eRespJoinRoomFlag.JOINGROOM_ALREADY_IN_ROOM) {
				//原则上此处可以直接进入房间，也可以是弹窗提示用户是否重新进入房间
				//
			}

			// 设置相关数据
            nRoom.Room.setRoom(resp.roomId,resp.levelId,resp.plazaid,
                resp.roomType,resp.owner,resp.rule,resp.baseScore);
			nRoom.Room.isRelink = resp.isRelink;

			//这里需要判断是哪种类型的房间
			if (nRoom.Room.roomType == ProtocolDefine.nRoom.eCreateRoomType.ROOM_ROOM) {

				let efmsg : ProtocolDefine.nRoom.msgNotifyEnterRoomFinish =  {
                    isRelink : nRoom.Room.isRelink
                }
				if(!nRoom.Room.isRelink){
                    //刷新房间规则显示
                    let star : number = 0;
                    if (nRoom.Room.plazaid != 0) {
						star = nLobby.Lobby.getPlazaById(nRoom.Room.plazaid)?.star!;
					}
					let rr : RoomEvent.IUpdateRoomRule = { 
                        playerNum : nRoom.Room.roomRule.playerNum,
                        gameTime : nRoom.Room.roomRule.gameTime,
                        gridLevel : nRoom.Room.roomRule.gridLevel,
                        rule : nRoom.Room.roomRule.rule,
                        lmtRound : nRoom.Room.roomRule.lmtRound,
                        lmtTurnTime : nRoom.Room.roomRule.lmtTurnTime,
                        roomLevel : resp.levelId,
                        roomID : resp.roomId,
                        plazaName : nRoom.Room.plazaName,
                        tag : nRoom.Room.tagId,
                        type : nRoom.Room.roomType,
                        star :star
                    }
					ProtocolManager.getInstance().SendMsg(ProtocolDefine.GameProtocol.P_GAME_ENTER_ROOM_FINISH,Utils.encodeMsg(efmsg));

                    Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_ROOMRULE],rr);

				}else{
					director.loadScene(CommonDefine.eSceneType[CommonDefine.eSceneType.Game],(err, scene)=>{
						//启动游戏界面，重连不需要进入游戏等待匹配界面。且再事件监听添加完成后方可发送enterroom finish
						ProtocolManager.getInstance().SendMsg(ProtocolDefine.GameProtocol.P_GAME_ENTER_ROOM_FINISH,Utils.encodeMsg(efmsg));
					});
				}


			} else if (nRoom.Room.roomType == ProtocolDefine.nRoom.eCreateRoomType.ROOM_TEAM) {
				//
			} else {
				if(resp.isRelink){
					//创建房间模式，房主不应该收到这个消息，因为其是主动触发的
					
					director.loadScene(CommonDefine.eSceneType[CommonDefine.eSceneType.Game],(err, scene)=>{
						//启动游戏界面，重连不需要进入游戏等待匹配界面
						let efmsg2 : ProtocolDefine.nRoom.msgNotifyEnterRoomFinish =  {
							isRelink : true
						}
						ProtocolManager.getInstance().SendMsg(ProtocolDefine.GameProtocol.P_GAME_ENTER_ROOM_FINISH,Utils.encodeMsg(efmsg2));
					});
				}else{
					//进入游戏等待匹配界面
					Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.SHOW_LOBBY_PANEL],
						LobbyEvent.eLobbyPanel.LOBBY_ROOMWAITMATCH_PANEL);
				}
			}

			//结束处理
			return;

		}else if(resp.flag == ProtocolDefine.nRoom.eRespJoinRoomFlag.JOINGROOM_FAIL_ROOM_NOT_EXIST){
			tip = "房间不存在，请重试";
		}else if(resp.flag == ProtocolDefine.nRoom.eRespJoinRoomFlag.JOINROOM_ACCOUNT_ERR){
			tip = "加入失败，用户异常";
		}else if(resp.flag == ProtocolDefine.nRoom.eRespJoinRoomFlag.JOINROOM_FAIL_NO_FREE_ROOM){
			tip = "加入失败，没有可用的房间";
		}else if(resp.flag == ProtocolDefine.nRoom.eRespJoinRoomFlag.JOINROOM_FIAL_SYSERR){
			tip = "加入失败，系统错误";
		}else if(resp.flag == ProtocolDefine.nRoom.eRespJoinRoomFlag.JOINROOM_GOLD_LESS){
			tip = "加入失败，您的积分不足，请充值";
		}else if(resp.flag == ProtocolDefine.nRoom.eRespJoinRoomFlag.JOINROOM_GOLD_MORE){
			tip = "加入失败，您太有钱了，请到其他模式游戏";
		}else if(resp.flag == ProtocolDefine.nRoom.eRespJoinRoomFlag.JOINROOM_LEVEL_LESS){
			tip = "加入失败，您的级别太高了";
		}else if(resp.flag == ProtocolDefine.nRoom.eRespJoinRoomFlag.JOINROOM_LEVEL_MORE){
			tip = "加入失败，您的级别太低了";
		}else if(resp.flag == ProtocolDefine.nRoom.eRespJoinRoomFlag.JOINROOM_PLAZA_ERR){
			tip = "加入失败，参数错误";
		}else if(resp.flag == ProtocolDefine.nRoom.eRespJoinRoomFlag.JOINROOM_PWD_ERR){
			tip = "加入失败，密码错误";
		}

		this.showDialog (tip);
	}
	public OnRespLeaveRoom(msg : any) : void{
		let resp : ProtocolDefine.nRoom.msgRespLeaveRoom = msg;

		if (resp.type == ProtocolDefine.nRoom.eLeaveType.LEAVE_CANT_LEAVE) {
			//不能离开，目前是游戏不能离开，此消息在游戏中的时候离开会收到
		}else if(resp.type == ProtocolDefine.nRoom.eLeaveType.LEAVE_ESCAPE){
			//逃跑，目前不支持
		}else if(resp.type == ProtocolDefine.nRoom.eLeaveType.LEAVE_KICK){
			//被t了，目前不支持
		}else if(resp.type == ProtocolDefine.nRoom.eLeaveType.LEAVE_NORMAL){
			//正常离开，切到大厅界面
			if (nRoom.Room.roomType == ProtocolDefine.nRoom.eCreateRoomType.ROOM_CLASSIC_PLAZA) {
				Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.SHOW_LOBBY_PANEL],
					LobbyEvent.eLobbyPanel.LOBBY_LOBBY_PANEL);
			} else if(nRoom.Room.roomType == ProtocolDefine.nRoom.eCreateRoomType.ROOM_PLAZA){
				Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.SHOW_LOBBY_PANEL],
					LobbyEvent.eLobbyPanel.LOBBY_PLAZAROOM_PLAZA_PANEL);
			}else{
				//此处为离开队伍或者离开房间，对于自己而言，这就是解散同样的处理
				Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_DISSOLVE_ROOM]);
			}
		}else if(resp.type == ProtocolDefine.nRoom.eLeaveType.LEAVE_NOT_IN_ROOM){
			//不在房间中，直接切到大厅界面
			Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.SHOW_LOBBY_PANEL],
				LobbyEvent.eLobbyPanel.LOBBY_LOBBY_PANEL);
		}else if(resp.type == ProtocolDefine.nRoom.eLeaveType.LEAVE_DISSOLVE){
			// 房间解散
			//切换面板
			Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_DISSOLVE_ROOM]);
		}

		nRoom.Room.reset();
	}
	public OnRespRoomList(msg : any)
	{
		this.showLoading(false);
		let resp : ProtocolDefine.nRoom.msgRespRoomList = msg;
		//
		nRoom.Room.roomList= [];//首先清空
		for (var i = 0; i < resp.roomList.length; i++) {
			let  rd : nRoom.IRoom = {
				isFull : resp.roomList[i].isFull,
				roomDes : resp.roomList[i].roomDes,
				roomId : resp.roomList[i].roomId,
				roomName : resp.roomList[i].roomName,
				roomPersonCnt : resp.roomList[i].roomPersonCnt,
				roomPwd : resp.roomList[i].roomPwd,
				rule : resp.roomList [i].rule
			}
			nRoom.Room.roomList.push(rd);
			
		}

		//刷新界面,如果正在显示。一般这条消息是显示房间列表的时候再请求的，所以一般会正在显示。请求的时候加loading
		this.onEventShowRoomList();
	}
	public OnRespPlayerAct(msg : any)
	{
		// 自己只收到一个简单的响应,别人准备收到的是 playerstate
		//ret:
		let resp : ProtocolDefine.msgSimpleResp = msg;
		let self : nAccount.SelfData = nAccount.Account.getSelfData();

		if (resp.ret == 0) {
			//自己准备成功
			if (nRoom.Room.updatePlayerStateByUserID(self.userID,
				ProtocolDefine.nRoom.eStateType.STATE_TYPE_ROOMREADY)) {

				let ps : RoomEvent.IUpdatePlayerState = {
					state : ProtocolDefine.nRoom.eStateType.STATE_TYPE_ROOMREADY,
					local : nRoom.Room.getLocalBySeat(nRoom.Room.selfSeat),
					ifAllReady : nRoom.Room.getIfAllPlayerReady ()
				}

				Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_PLAER_STATE],ps);

				//准备成功，上报天赋列表
				let player : nRoom.Player | null = nRoom.Room.getPlayerBySeat(nRoom.Room.selfSeat);
				if(player == null) return;
				let ptl : RoomEvent.IPlayerTalentList = {
					local : ps.local,
					talentList : player.talentList
				}

				// ptl.talentList = new List<int>();
				// for(int i = 0;i < player.Value.talentList.Count;i++){
				// 	ptl.talentList.Add ((int)player.Value.talentList[i]);
				// }

				this.onEventReportTalent(ptl);
			}
		}
	}
	public OnRespPlayerTalkMsg(msg : any)
	{
		// 自己只收到一个简单的响应
		//ret = 0成功
		//msgSimpleResp resp = msgSimpleResp.deserialize(msg);
		//自己发聊天消息，可以在发送的时候就显示，不用等这个响应

		this.OnPlayerTalk(msg);
	}
	//玩家聊天 --如果是游戏中的聊天需要游戏中的逻辑处理，这里只是房间内，目前不支持
	public OnPlayerTalk(msg : any)
	{
		let resp : ProtocolDefine.nRoom.msgPlayerTalkMsg = msg;
		if (resp.flag == ProtocolDefine.eFlag.SUCCESS) {
			Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.SHOW_TALK_MSG],
				nRoom.Room.getLocalBySeat(resp.seat),
				resp.content);
		}
	}
	public OnGameStart(msg : any){
		//创建房间模式，房主不应该收到这个消息，因为其是主动触发的
		director.loadScene(CommonDefine.eSceneType[CommonDefine.eSceneType.Game],(err, scene)=>{
			//启动游戏界面，重连不需要进入游戏等待匹配界面
		});
	}
	//玩家进入房间
	public OnPlayerEnter(msg : any)
	{
		let resp : ProtocolDefine.nRoom.msgPlayerInfo = msg;

		let self : nAccount.SelfData = nAccount.Account.getSelfData();
		if(resp.userID != self.userID && nRoom.Room.playerList.length == 0){
			console.log("第一个进来的玩家不是自己，这会导致座位错误，无法处理，出错！");
			return;
		}

		//将数据写入游戏房间数据
		let talentList : Array<nLobby.eTalentType> = [];
		//进来的如果是自己，则初始化天赋列表
		//从自己的数据中获取
		if(resp.userID == self.userID){
			//self
			talentList = self.talentList;
		}

		let player : nRoom.Player = { 
			charm : resp.charm,
			draw : resp.draw,
			escapse : resp.escape,
			vip : resp.vip,
			gold : resp.gold,
			head : resp.headUrl,
			lose : resp.lose,
			name : resp.name,
			score : resp.score,
			seat : resp.seat,
			sex : resp.sex,
			state : ProtocolDefine.nRoom.eStateType.STATE_TYPE_SITDOWN,// 默认坐下状态，接下来要准备
			userID : resp.userID,
			win : resp.win,
			isOwner : nRoom.Room.owner == resp.userID,
			talentList : talentList
		};
		//原则上来说，第一个进入的必须是自己，否则不应该处理
		nRoom.Room.addPlayer(player);

		//显示用户， 此处需要将seat转为local
		Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.PLAER_ENTER],player);
	}
	//玩家准备等
	public OnPlayerState(msg : any)
	{
		let resp : ProtocolDefine.nRoom.msgPlayerState = msg;
		if (nRoom.Room.updatePlayerStateByUserID(resp.userID,resp.state)) {
			//用户存在，则通知更新用户状态
			//诸如已准备、离线等
			//纯界面数据定义，请定义在roomevent里
			let ps : RoomEvent.IUpdatePlayerState = {
				state : resp.state,
				local : nRoom.Room.getLocalBySeat(resp.seat),
				ifAllReady : nRoom.Room.getIfAllPlayerReady()
			}

			Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_PLAER_STATE],ps);
		}
	}
	//玩家离开房间
	public OnPlayerLeave(msg : any)
	{
		//自己离开收到的是另外一个消息：msgRespLeaveRoom，如果是非请求离开，则会收到这个，需要根据id判断是否是自己。
		//目前不支持t人，所以自己一般不会收到这个消息
		let resp : ProtocolDefine.nRoom.msgPlayerLeave = msg;

		let self : nAccount.SelfData= nAccount.Account.getSelfData();
		if (resp.userID == self.userID) {
			if (resp.type == ProtocolDefine.nRoom.ePlayerLeaveRoomType.LEAVE_ROOM_GAMEEND) {
				//此时清空房间缓存数据
				nRoom.Room.reset();
			
			}else if(resp.type == ProtocolDefine.nRoom.ePlayerLeaveRoomType.LEAVE_ROOM_REMOVED){
				//
			}

		}else{
			if (ProtocolDefine.nRoom.ePlayerLeaveRoomType.LEAVE_ROOM_OWNER_DISSOLVE == resp.type) {
				//解散房间 相当于自己退出
				////切换面板
				Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_DISSOLVE_ROOM]);
				nRoom.Room.reset();
			}else{
				//别人退出
				if (nRoom.Room.removePlayerBySeat(resp.seat)) {
					Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_LEAVE_ROOM],
						nRoom.Room.getLocalBySeat(resp.seat));
				}
			}
		}
	}

	// 这里不应该收到时钟消息
	public OnPlayerClock(msg : any){
		let resp : ProtocolDefine.nRoom.msgClock = msg;
		//可以用于准备倒计时，防止一直等待
	}
	public OnRoomStateChange(msg : any){
		let resp : ProtocolDefine.nRoom.msgRoomStateChange = msg;
		let rd : nRoom.IRoom = {
			roomId : resp.roomId,
			roomDes : "",
			isFull : 0,
			roomName : "",
			roomPersonCnt : 0,
			rule : "",
			roomPwd : ""
		};

		if (resp.type == ProtocolDefine.nRoom.eRooStateChangeType.ROOMSTATE_ADD) {
			rd.isFull = 0;
			rd.roomName = resp.roomName;
			rd.roomPersonCnt = 0;
			rd.rule = resp.rule;
			rd.roomPwd = resp.roomPassword;
			rd.roomDes = "add";

			nRoom.Room.addRoomListByRoomID(resp.roomId,rd);
		} else if (resp.type == ProtocolDefine.nRoom.eRooStateChangeType.ROOMSTATE_REMOVE) {
			nRoom.Room.removeRoomListByRoomID(resp.roomId);
			rd.roomDes = "remove";
			nRoom.Room.addRoomListByRoomID(resp.roomId,rd);
		} else if (resp.type == ProtocolDefine.nRoom.eRooStateChangeType.ROOMSTATE_UPDATE) {
			rd.roomDes = "update";
			rd.roomPersonCnt = resp.personCnt;

			nRoom.Room.updateRoomListByRoomID(resp.roomId,resp.personCnt);
		}

		// 更新房间列表信息，只有显示房间列表界面的时候才有用
		Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_ROOM_STATE],rd);
	}

	//----------------------------
	public showDialog(tip : string){
		let dlg : IDialog = {
			type : eDialogEventType.SIMPLE,
			tip : tip,
			hasOk : false,
			okText : "确定",
			hasCancel : false,
			cancelText : "取消",
			hasClose : true,
			closeText : "确定",
			callBack : ()=>{}
		};

		Utils.getGlobalController()?.Emit(CommonEvent.EVENT[CommonEvent.EVENT.SHOW_DIALOG],dlg);
	}
}