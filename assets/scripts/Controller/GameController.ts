
import { director } from "cc";
import { CommonDefine } from "../Define/CommonDefine";
import { ProtocolDefine } from "../Define/ProtocolDefine";
import { GameEvent } from "../Event/GameEvent";
import { LobbyEvent } from "../Event/LobbyEvent";
import { RoomEvent } from "../Event/RoomEvent";
import { Account, SelfData } from "../Model/Account";
import { nGame } from "../Model/Game";
import { Lobby } from "../Model/Lobby";
import { nRoom } from "../Model/Room";
import { ProtocolManager } from "../ProtocolManager/ProtocolManager";
import { Utils } from "../Utils/Utils";

export class GameController{
    public static _instance : GameController;
    constructor() {

    }

    public static getInstance() : GameController{
        if(this._instance == null){
            this._instance = new GameController();
        }
        return this._instance;
    }

    public AddAllEvent() : void{

        this.addAllProtocolEvent();
    }
    public RemoveAllEvent() : void{

        this.removeAllProtocolEvent()
    }

    private addAllProtocolEvent() : void{
        //push消息
        ProtocolManager.getInstance().On(ProtocolDefine.GameProtocol.P_GAME_CLOCK,
            this.OnPlayerClock.bind(this));//玩家步骤剩余时间
        Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.START_GAME],
            this.onEventStartGame.bind(this),GameController);
    }
    private removeAllProtocolEvent() : void{
        //push消息
        ProtocolManager.getInstance().Off(ProtocolDefine.GameProtocol.P_GAME_CLOCK,
            this.OnPlayerClock.bind(this));//玩家步骤剩余时间
        Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.START_GAME],
            this.onEventStartGame.bind(this),GameController);
    }


    //-----------------界面消息------------------
    public onEventStartGame(isEnterRoomFinsh : boolean){
        let sgmsg : ProtocolDefine.nRoom.msgNotifyStartGame = {
        	game : ProtocolDefine.GameType.GAME_LIANQI,
        	isEnterRoomFinsh : isEnterRoomFinsh
        }

        ProtocolManager.getInstance().SendMsg(ProtocolDefine.GameProtocol.P_GAME_START_GAME, 
        	Utils.encodeMsg(sgmsg));
    }
    //-----------------网络消息--------------
    public OnPlayerClock(msg : any){
		let resp : ProtocolDefine.nRoom.msgClock = msg;

		let sc : GameEvent.IUpdateClock = {
		    local : resp.seat,
            leftTime : resp.leftTime,
            step : resp.step
        };

        Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.CLOCK],sc);
    }
    
    public OnLQStart(msg : any)
	{
		//联棋游戏开始 -播放相关动画
		let resp : ProtocolDefine.nGame.nLianQi.msgLianQiStart = msg;
		if (resp.flag == 0) {
            nGame.GameData.firstHandSeat = resp.firstHandSeat;
            
            // 通知界面，因为要切换，这里似乎没有意义
            Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_GAME_START],resp.firstHandSeat);
		}
	}
}