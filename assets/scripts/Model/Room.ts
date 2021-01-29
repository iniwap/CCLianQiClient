//
//房间数据
//

import { ProtocolDefine } from "../Define/ProtocolDefine";
import { nAccount } from "./Account";
import { nLobby } from "./Lobby";

export namespace nRoom{

	export enum eRoomActionType{
		CAN_NONE,
		CAN_CREATE_ROOM,
		CAN_LEAVE_ROOM,
		CAN_DISSOLVE,
	};
	export enum eRoomPlayerType{
		ROOM_WIAT,// 房间玩家
		GAME_WAIT,//游戏等待时玩家
	};

    export interface Player{
		seat : number;
		isOwner : boolean;
		state : ProtocolDefine.nRoom.eStateType;
		userID : number;
		name : string;
		head : string;
		vip : number;
		sex : number;//0女，1男
		win : number;
		lose : number;
		draw : number;
		escapse : number;
		charm : number;//魅力值
		gold : number;//金币,主要消耗货币类型
		score : number;

		talentList : Array<nLobby.eTalentType>;
    };
    
    export interface IRoom{
		roomId : number;
		isFull : number;
		roomName : string;
		roomDes : string;
		roomPersonCnt : number;
		roomPwd : string;
		rule : string;
    };

    export interface RoomRule
	{
		playerNum : number;
		gridLevel : number;
		rule : string;//额外规则，诸如三禁手，自动开始，默认等等
		gameTime : number;
		lmtRound : number;
		lmtTurnTime : number;
		//ect ...
	}
    
	export enum  eSeatType{
		SELF = 0,
		RIGHT = 1,
		TOP = 2,
		LEFT = 3,
		INVILID = 255,
	};
    export class Room{
		public static roomID : number;
		public static rule : string;
		public static roomRule : RoomRule;
		public static selfSeat : number;
		public static isRelink : boolean;
		public static roomLevel : number;
		public static owner : number;
		public static baseScore : number;

		//
		public static tagId : number;
		public static plazaName : string;
		public static plazaid : number;
		public static roomType : ProtocolDefine.nRoom.eCreateRoomType ;
		public static hasAbandon : boolean;// 自己是否已经投降了

		public static playerList : Array<Player> = [];//存储对局玩家	
		public static roomList : Array<IRoom> = [];//此条不随具体对局变化，是静态数据，只有再次收到才清空

		public static reset() : void{
			this.roomType = ProtocolDefine.nRoom.eCreateRoomType.ROOM_NONE;
			this.plazaid = 0;
			this.plazaName = "";
			this.tagId = -1;
			this.roomLevel = 0;
			this.owner = 0;
			this.roomID = 0;
			this.rule = "";
			//roomRule.playerNum = 0;
			this.playerList = [];
			this.selfSeat = 255;
			this.isRelink = false;
			this.baseScore = 0;
			this.hasAbandon = false;

			nAccount.Account.inRoomId = 0;//清除
		}
		public static getAllPlayers() : Array<Player>{
			return this.playerList;
		}
		public static setPlazaData(name : string,tag : number) : void{
			this.tagId = tag;
			this.plazaName = name;
		}
        public static setRoom(roomid : number,levelId : number,plazaID : number,
            roomtype : number,roomOwner : number,ruleStr : string,bs : number){
			this.roomID = roomid;
			this.rule = ruleStr;
			this.roomLevel = levelId;
			this.owner = roomOwner;

			this.roomRule = JSON.parse(ruleStr);
			this.roomType = roomtype as ProtocolDefine.nRoom.eCreateRoomType;
			this.plazaid = plazaID;
			//其他参数
			this.baseScore = bs;
		}

		public static getPlayerNameBySeat(seat : number) : string{
			for (var i = 0; i < this.playerList.length; i++) {
				if (this.playerList[i].seat == seat) {
					return this.playerList[i].name;
				}
			}
			return "";
		}
		public static addPlayer(player : Player) : void{
			//存在则更新，不存在则添加
			for (var i = 0; i < this.playerList.length; i++) {
				if (this.playerList[i].userID == player.userID) {
					let p : Player = this.playerList[i];
					p.charm = player.charm;
					p.draw = player.draw;
					p.escapse = player.escapse;
					p.gold = player.gold;
					p.head = player.head;
					p.lose = player.lose;
					p.name = player.name;
					p.score = player.score;
					p.seat = player.seat;
					p.sex = player.sex;
					p.state = player.state;
					p.win = player.win;
					this.playerList[i] = p;
					return;
				}
			}

			//设置自己的座位
			if (player.userID == nAccount.Account.getSelfData().userID) {
				this.selfSeat = player.seat;
			}

			this.playerList.push(player);
		}
		public static removePlayerBySeat(seat : number) : boolean{
			for (var i = 0; i < this.playerList.length; i++) {
				if (this.playerList[i].seat == seat) {
					this.playerList.splice(i,1);
					return true;
				}
			}
			return false;
		}
		public static removePlayerByUserID(userID : number) : boolean{
			for (var i = 0; i < this.playerList.length; i++) {
				if (this.playerList[i].userID == userID) {
					this.playerList.splice(i,1);
					return true;
				}
			}
			return false;
		}

		public static getPlayerBySeat(seat : number) : Player | null{
			for (var i = 0; i < this.playerList.length; i++) {
				if (this.playerList[i].seat == seat) {
					return this.playerList[i];
				}
			}
			return null;
		}

		public static getPlayerByUserID(userID : number) : Player | null{
			for (var i = 0; i < this.playerList.length; i++) {
				if (this.playerList[i].userID == userID) {
					return this.playerList[i];
				}
			}
			return null;
		}

		public static updatePlayerStateByUserID(userID : number,state : ProtocolDefine.nRoom.eStateType) : boolean{
			for (var i = 0; i < this.playerList.length; i++) {
				if (this.playerList[i].userID == userID) {
					let p : Player = this.playerList[i];
					p.state = state;
					this.playerList[i] = p;
					return true;
				}
			}
			return false;
		}

		public static getIfAllPlayerReady() : boolean{
			let readyNum : number = 0;
			for (var i = 0; i < this.playerList.length; i++) {
				if (this.playerList[i].state == ProtocolDefine.nRoom.eStateType.STATE_TYPE_ROOMREADY) {
					readyNum++;
				}
			}

			if (readyNum == this.roomRule.playerNum) {
				return true;
			} else {
				return false;				
			}
		}

		public static updatePlayerStateBySeat(seat : number,state : ProtocolDefine.nRoom.eStateType) : boolean{
			for (var i = 0; i < this.playerList.length; i++) {
				if (this.playerList[i].seat == seat) {
					let p : Player = this.playerList[i];
					p.state = state;
					this.playerList[i] = p;
					return true;
				}
			}
			return false;
		}

		public static setHasAbandon() : void{
			this.hasAbandon = true;
		}

		public static getHasAbandon() : boolean{

			return this.hasAbandon;
		}

		public static getLocalBySeat(seat : number) : number{
			let PLAYER_2 = [0,2];//0,1
			let PLAYER_3 = [0,1,3];//0,1,2
			let PLAYER_4 = [0,1,2,3];//0,1,2,3

			if(seat < 0 || seat > this.roomRule.playerNum - 1){
				return eSeatType.SELF as number;
			}

			let index : number = (seat - this.selfSeat + eSeatType.SELF + this.roomRule.playerNum) % this.roomRule.playerNum;
			if (this.roomRule.playerNum == 2) {
				return PLAYER_2[index];
			} else if (this.roomRule.playerNum == 3) {
				return PLAYER_3[index];
			} else if (this.roomRule.playerNum == 4) {
				return PLAYER_4[index];
			}

			//BUG
			return eSeatType.SELF;
		}

		public static getSeatByLocal(local : number) : number{
			let PLAYER_2 = [0,2];//0,1
			let PLAYER_3 = [0,1,3];//0,1,2
			let PLAYER_4 = [0,1,2,3];//0,1,2,3

			if (local < 0 || local > this.roomRule.playerNum) {
				return this.selfSeat;
			}
			let localIndex : number = 0;
			let pseat = PLAYER_2;

			if (this.roomRule.playerNum == 2) {
				pseat = PLAYER_2;
			}else if(this.roomRule.playerNum == 3){
				pseat = PLAYER_3;
			}else if(this.roomRule.playerNum == 4){
				pseat = PLAYER_4;
			}
			for (var i = 0; i < pseat.length; i++) {
				if (local == pseat [i]) {
					localIndex = i;
					break;
				}
			}
			return (this.selfSeat + localIndex ) % this.roomRule.playerNum;
		}
		public static updateRoomListByRoomID(roomid : number,pcnt : number) : boolean{
			for (var i = 0; i < this.roomList.length; i++) {
				if (roomid == this.roomList[i].roomId) {
					let rd : IRoom = this.roomList[i];
					rd.roomPersonCnt = pcnt;
					this.roomList[i] = rd;
					return true;
				}
			}

			return false;
		}
		public static removeRoomListByRoomID(roomid : number) : boolean{
			for (var i = 0; i < this.roomList.length; i++) {
				if (roomid == this.roomList[i].roomId) {
					this.roomList.splice(i,1);
					return true;
				}
			}
			return false;
		}
		public static addRoomListByRoomID(roomid : number,data :IRoom) : void{
			for (var i = 0; i < this.roomList.length; i++) {
				if (roomid == this.roomList[i].roomId) {
					//更新
					let rd : IRoom = this.roomList[i];
					rd.isFull = data.isFull;
					rd.roomDes = data.roomDes;
					rd.roomId = data.roomId;
					rd.roomName = data.roomName;
					rd.roomPersonCnt = data.roomPersonCnt;
					rd.roomPwd = data.roomPwd;
					rd.rule = data.rule;
					this.roomList[i] = rd;
					return;
				}
			}
			this.roomList.push(data);
		}
	}
};