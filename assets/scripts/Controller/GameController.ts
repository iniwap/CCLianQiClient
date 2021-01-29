
import { director } from "cc";
import { eDialogEventType, IDialog } from "../Common/Dialog";
import { CommonDefine } from "../Define/CommonDefine";
import { ProtocolDefine } from "../Define/ProtocolDefine";
import { CommonEvent } from "../Event/CommonEvent";
import { GameEvent } from "../Event/GameEvent";
import { RoomEvent } from "../Event/RoomEvent";
import { AILogic } from "../GameLogic/AI/AILogic";
import { nAccount } from "../Model/Account";
import { nGame } from "../Model/Game";
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
        //注册界面消息
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.PLAY],
			this.onEventPlay.bind(this),GameController);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.ABANDON],
            this.onEventAbandon.bind(this),GameController);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.DRAW],
            this.onEventDraw.bind(this),GameController);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.MOVE],
            this.onEventMove.bind(this),GameController);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.PASS],
            this.onEventPass.bind(this),GameController);
        
        //ai落子，只有单机模式才会出现，暂不支持智能提示
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.AI_PLAY],
            this.OnAIPlay.bind(this),GameController);
        Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.START_AI_GAME],
            this.onEventStartAIGame.bind(this),GameController);

        //注册网络消息
        ProtocolManager.getInstance().On(ProtocolDefine.GameProtocol.P_GAME_CLOCK,this.OnPlayerClock.bind(this));//玩家步骤剩余时间
        ProtocolManager.getInstance().On(ProtocolDefine.GameLianQiProtocol.P_GAME_LIANQI_START,this.OnLQStart.bind(this));//联棋游戏开始 -播放相关动画
        ProtocolManager.getInstance().On(ProtocolDefine.GameLianQiProtocol.P_GAME_LIANQI_FLAG,this.OnLQFlag.bind(this));//标志,诸如重连，特殊棋型出现
        ProtocolManager.getInstance().On(ProtocolDefine.GameLianQiProtocol.P_GAME_LIANQI_QI,this.OnLQ.bind(this));//联棋棋盘数据
        ProtocolManager.getInstance().On(ProtocolDefine.GameLianQiProtocol.P_GAME_LIANQI_RESP_DRAW,this.OnRespDraw.bind(this));//请和响应
        ProtocolManager.getInstance().On(ProtocolDefine.GameLianQiProtocol.P_GAME_LIANQI_RESP_MOVE,this.OnRespMove.bind(this));//请求移动响应
        ProtocolManager.getInstance().On(ProtocolDefine.GameLianQiProtocol.P_GAME_LIANQI_RESP_PASS,this.OnRespPass.bind(this));//请求过
        ProtocolManager.getInstance().On(ProtocolDefine.GameLianQiProtocol.P_GAME_LIANQI_RESP_PLAY,this.OnRespPlay.bind(this));//请求落子
        ProtocolManager.getInstance().On(ProtocolDefine.GameLianQiProtocol.P_GAME_LIANQI_RESULT,this.OnLQResult.bind(this));//结算
        ProtocolManager.getInstance().On(ProtocolDefine.GameLianQiProtocol.P_GAME_LIANQI_TURN,this.OnLQTurn.bind(this));//该谁落子
        ProtocolManager.getInstance().On(ProtocolDefine.GameLianQiProtocol.P_GAME_LIANQI_RESP_ABANDON,this.OnLQAbandon.bind(this));//联棋投降
        ProtocolManager.getInstance().On(ProtocolDefine.GameLianQiProtocol.P_GAME_LIANQI_ABANDON_PASS,this.OnLQAbandonPass.bind(this));//投降玩家自动pass
    }
    public RemoveAllEvent() : void{
        //注册界面消息
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.PLAY],
			this.onEventPlay.bind(this),GameController);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.ABANDON],
            this.onEventAbandon.bind(this),GameController);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.DRAW],
            this.onEventDraw.bind(this),GameController);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.MOVE],
            this.onEventMove.bind(this),GameController);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.PASS],
            this.onEventPass.bind(this),GameController);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.AI_PLAY],
            this.OnAIPlay.bind(this),GameController);
        Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.START_AI_GAME],
            this.onEventStartAIGame.bind(this),GameController);
        //注册网络消息
        ProtocolManager.getInstance().Off(ProtocolDefine.GameProtocol.P_GAME_CLOCK,this.OnPlayerClock.bind(this));//玩家步骤剩余时间
        ProtocolManager.getInstance().Off(ProtocolDefine.GameLianQiProtocol.P_GAME_LIANQI_START,this.OnLQStart.bind(this));//联棋游戏开始 -播放相关动画
        ProtocolManager.getInstance().Off(ProtocolDefine.GameLianQiProtocol.P_GAME_LIANQI_FLAG,this.OnLQFlag.bind(this));//标志,诸如重连，特殊棋型出现
        ProtocolManager.getInstance().Off(ProtocolDefine.GameLianQiProtocol.P_GAME_LIANQI_QI,this.OnLQ.bind(this));//联棋棋盘数据
        ProtocolManager.getInstance().Off(ProtocolDefine.GameLianQiProtocol.P_GAME_LIANQI_RESP_DRAW,this.OnRespDraw.bind(this));//请和响应
        ProtocolManager.getInstance().Off(ProtocolDefine.GameLianQiProtocol.P_GAME_LIANQI_RESP_MOVE,this.OnRespMove.bind(this));//请求移动响应
        ProtocolManager.getInstance().Off(ProtocolDefine.GameLianQiProtocol.P_GAME_LIANQI_RESP_PASS,this.OnRespPass.bind(this));//请求过
        ProtocolManager.getInstance().Off(ProtocolDefine.GameLianQiProtocol.P_GAME_LIANQI_RESP_PLAY,this.OnRespPlay.bind(this));//请求落子
        ProtocolManager.getInstance().Off(ProtocolDefine.GameLianQiProtocol.P_GAME_LIANQI_RESULT,this.OnLQResult.bind(this));//结算
        ProtocolManager.getInstance().Off(ProtocolDefine.GameLianQiProtocol.P_GAME_LIANQI_TURN,this.OnLQTurn.bind(this));//该谁落子
        ProtocolManager.getInstance().Off(ProtocolDefine.GameLianQiProtocol.P_GAME_LIANQI_RESP_ABANDON,this.OnLQAbandon.bind(this));//联棋投降
        ProtocolManager.getInstance().Off(ProtocolDefine.GameLianQiProtocol.P_GAME_LIANQI_ABANDON_PASS,this.OnLQAbandonPass.bind(this));//投降玩家自动pass
    }

    //-----------------界面消息------------------
    public onEventStartAIGame() : void{
        //设置房间数据
        nRoom.Room.reset();
        nRoom.Room.selfSeat = 0;
        nRoom.Room.roomRule = {
            playerNum : 2,
            gridLevel : 4,
            rule : "",
            gameTime : 0,
            lmtRound : 100,//限定100回合
            lmtTurnTime : 0
        };
        
        //塞自己
        let self : nAccount.SelfData = nAccount.Account.getSelfData();
        let player : nRoom.Player = { 
			charm : self.charm,
			draw : self.draw,
			escapse : self.escape,
			vip : 0,
			gold : self.gold,
			head : "",
			lose : self.lose,
			name : self.name,
			score : self.score,
			seat : 0,
			sex : self.sex,
			state : ProtocolDefine.nRoom.eStateType.STATE_TYPE_ROOMREADY,
			userID : self.userID,
			win : self.win,
			isOwner : false,
			talentList : self.talentList
		};
		nRoom.Room.addPlayer(player);
        //塞一个机器人 seat=1
        AILogic.getInstance().init(1,4);
        let aiplayer : nRoom.Player = { 
			charm : 0,
			draw : 0,
			escapse : 0,
			vip : 0,
			gold : 0,
			head : "",
			lose : 0,
			name : "机器人",
			score : 0,
			seat : 1,
			sex : 1,
			state : ProtocolDefine.nRoom.eStateType.STATE_TYPE_ROOMREADY,
			userID : 9527,
			win : 0,
			isOwner : false,
			talentList : []
        };
        nRoom.Room.addPlayer(aiplayer);
        //设置游戏数据
        nGame.Game.reset();
        nGame.Game.currentTurn = 0;//先手总是自己
		nGame.Game.firstHandSeat = 0;
		nGame.Game.playerNum = 2;//玩家人数
		nGame.Game.boardLevel = 4;//棋盘阶数
		nGame.Game.chessBoard = null;
        nGame.Game.isAI = true;
        
        //启动游戏界面
		director.loadScene(CommonDefine.eSceneType[CommonDefine.eSceneType.Game],(err, scene)=>{
            //开始游戏
            nGame.Game.firstHandSeat = 0;//固定自己先手
            Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_GAME_START],0);

            this.OnLQTurn({seat : nRoom.Room.selfSeat,
                isPassTurn : false,
                isTimeOut : false,
                round : 0,
                lmt : []});
		});
    }
    public onEventStartGame(isEnterRoomFinsh : boolean) : void{
        let sgmsg : ProtocolDefine.nRoom.msgNotifyStartGame = {
        	game : ProtocolDefine.GameType.GAME_LIANQI,
        	isEnterRoomFinsh : isEnterRoomFinsh
        }

        ProtocolManager.getInstance().SendMsg(ProtocolDefine.GameProtocol.P_GAME_START_GAME, 
        	Utils.encodeMsg(sgmsg));
    }
    public onEventPlay(play : GameEvent.IPlay) : void{
		if (!this.checkSelfTurn()) {
			//给予提示，不该自己操作
			this.showDialog("当前不是您的回合阶段哟～");
			return;
		}

		if(nRoom.Room.getHasAbandon()){
			//已经投降了，不能操作
			this.showDialog ("您已经投降过了～");
			return;
        }

        //如果是单机模式
        if(nGame.Game.isAI){
            //直接响应，这里需要异步或延时
            Utils.getGlobalController()?.DelayCallback(()=>{
                
                this.AIBanDir(play.direction);

                this.OnRespPlay({
                    flag : ProtocolDefine.nGame.nLianQi.eGameOpRespFlag.SUCCESS,
                    seat : nRoom.Room.selfSeat,
                    x : play.x,
                    y : play.y,
                    direction : play.direction
                });
            },0.1);//自己操作速度快点
            
            return;
        }
        
		let rplay : ProtocolDefine.nGame.nLianQi.msgLianQiReqPlay = {
            direction : play.direction,
            seat : nRoom.Room.selfSeat,
            x : play.x,
            y : play.y
        };

        ProtocolManager.getInstance().SendMsg(ProtocolDefine.GameLianQiProtocol.P_GAME_LIANQI_REQ_PLAY,
            Utils.encodeMsg(rplay),
            this.OnRespPlay.bind(this));
    }
    public onEventMove(move : GameEvent.IMove) : void{
		if (!this.checkSelfTurn ()) {
			//给予提示，不该自己操作
			this.showDialog ("当前不是您的回合阶段哟～");
			return;
		}

		if(nRoom.Room.getHasAbandon()){
			//已经投降了，不能操作
			return;
        }
        
        if(nGame.Game.isAI){
            //直接响应
            Utils.getGlobalController()?.DelayCallback(()=>{
                this.OnRespMove({
                    flag : ProtocolDefine.nGame.nLianQi.eGameOpRespFlag.SUCCESS,
                    seat : nRoom.Room.selfSeat,
                    moveList : move.moveList
                });
            },0.1);
            return;
        }

        let rmove : ProtocolDefine.nGame.nLianQi.msgLianQiReqMove = {
            seat : nRoom.Room.selfSeat,
            moveList : move.moveList
        };

        ProtocolManager.getInstance().SendMsg(ProtocolDefine.GameLianQiProtocol.P_GAME_LIANQI_REQ_MOVE,
            Utils.encodeMsg(rmove),
            this.OnRespMove.bind(this));
    }
    public onEventPass() : void{
		if (!this.checkSelfTurn ()) {
			this.showDialog ("当前不是您的回合阶段哟～");
			return;
		}
		if(nRoom.Room.getHasAbandon()){
			//已经投降了，不能操作
			return;
        }
        
        if(nGame.Game.isAI){
            //
            Utils.getGlobalController()?.DelayCallback(()=>{
                //
                this.OnRespPass({
                    flag : ProtocolDefine.nGame.nLianQi.eGameOpRespFlag.SUCCESS,
                    seat : AILogic.getInstance().getAISeat()
                });
                //是否达到最大回合限制
                if(this.AICheckLmtRoundEndGame()) return;
                //切换到ai下棋
                AILogic.getInstance().AIThink(nGame.Game.chessBoard!);
            },0.1);

            return;
        }

        let rpass : ProtocolDefine.nGame.nLianQi.msgLianQiReqPass = {
            seat : nRoom.Room.selfSeat
        };

        ProtocolManager.getInstance().SendMsg(ProtocolDefine.GameLianQiProtocol.P_GAME_LIANQI_REQ_PASS,
            Utils.encodeMsg(rpass),
            this.OnRespPass.bind(this));
    }
    public onEventAbandon() : void{
		if (!this.checkSelfTurn ()) {
			this.showDialog ("当前不是您的回合阶段哟～");
			return;
		}

		if(nRoom.Room.getHasAbandon()){
			//已经投降了，不能操作
			return;
		}

        let msg : ProtocolDefine.nGame.nLianQi.msgLianQiReqAbandon = {
            seat : nRoom.Room.selfSeat
        };

        ProtocolManager.getInstance().SendMsg(ProtocolDefine.GameLianQiProtocol.P_GAME_LIANQI_REQ_ABANDON,
            Utils.encodeMsg(msg),
            this.OnLQAbandon.bind(this));
    }
    public onEventDraw() : void{
		if (!this.checkSelfTurn ()) {
			this.showDialog("当前不是您的回合阶段哟～");
			return;
		}

		if(nRoom.Room.getHasAbandon()){
			//已经投降了，不能操作
			return;
		}

        let msg : ProtocolDefine.nGame.nLianQi.msgLianQiReqDraw = {
            seat : nRoom.Room.selfSeat
        };

        ProtocolManager.getInstance().SendMsg(ProtocolDefine.GameLianQiProtocol.P_GAME_LIANQI_REQ_DRAW,
            Utils.encodeMsg(msg),
            this.OnRespDraw.bind(this));
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
            nGame.Game.firstHandSeat = resp.firstHandSeat;
            
            // 通知界面，因为要切换，这里似乎没有意义
            Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_GAME_START],resp.firstHandSeat);
		}
    }
	public OnLQFlag(msg : any) : void {
		//标志,诸如重连，特殊棋型出现
		// 重连期间不播放任何动画，请根据标志判断
		let resp : ProtocolDefine.nGame.nLianQi.msgLianQiFlag = msg;
		if (resp.flag == ProtocolDefine.nGame.nLianQi.eFlagType.RELINK_TYPE_BEGIN) {
			//
		} else if (resp.flag == ProtocolDefine.nGame.nLianQi.eFlagType.RELINK_TYPE_END) {
			//
		}

		//用户动画以及重连标示控制
        Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_FLAG],resp.flag);
    }
    
    public OnLQ(msg : any) : void {
		//联棋棋盘数据
		//此消息原则上只在重连的时候收到，以此更新棋盘
		let resp : ProtocolDefine.nGame.nLianQi.msgLianQi = msg;

		//刷新棋盘
        Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_LIANQI],resp.checkerBoard);
    }
    public OnRespDraw(msg : any) : void{
		//请和响	应
		let resp : ProtocolDefine.nGame.nLianQi.msgLianQiRespDraw = msg;

		if (resp.type == ProtocolDefine.nGame.nLianQi.eReqRespType.REQ) {
			//别的玩家请求和棋，向大家显示请求和棋的提示
            Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_DRAW],
                nRoom.Room.getLocalBySeat(resp.seat),
                nRoom.Room.getPlayerNameBySeat(resp.seat));

		}else if(resp.type == ProtocolDefine.nGame.nLianQi.eReqRespType.REQ_RESP){
			//收到别人是否同意的和棋
            Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_DRAW_RESULT],
                nRoom.Room.getLocalBySeat(resp.seat),
                nRoom.Room.getPlayerNameBySeat(resp.seat));

		}else if(resp.type == ProtocolDefine.nGame.nLianQi.eReqRespType.RESP){
			// 自己请求或者响应请求的 响应，无需处理
		}
    }
    public OnRespPass(msg : any) : void{
		//请求过
		let resp : ProtocolDefine.nGame.nLianQi.msgLianQiRespPass = msg;
		if (resp.flag == 0) {
            nGame.Game.currentTurn = resp.turn;
            Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_PASS],
                nRoom.Room.getLocalBySeat(resp.turn));

		} else {
            Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.ACTION_FAIL],GameEvent.EVENT.PASS);
		}
    }
    public OnRespPlay(msg : any) : void{
		//请求落子
		let resp : ProtocolDefine.nGame.nLianQi.msgLianQiRespPlay = msg;

		if (resp.flag != ProtocolDefine.nGame.nLianQi.eGameOpRespFlag.SUCCESS) {
			//不成功
            //根据具体值给予错误提示,只有是自己下棋的响应时才显示
            if(this.checkSelfTurn()){
                Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.ACTION_FAIL],GameEvent.EVENT.PLAY);
            }
			return;
		}
        let chees : ProtocolDefine.nGame.nLianQi.Chess = {
            x : resp.x,
            y : resp.y,
            direction : resp.direction,
            playerID : resp.seat
        };
        let chessList : Array<ProtocolDefine.nGame.nLianQi.Chess> = [];
        chessList.push(chees);
		let pm : GameEvent.IPlayOrMove = {
            isAI : false,
            isMove : false,
            local : nRoom.Room.getLocalBySeat(resp.seat),
            chessList : chessList
        }

        Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_PLAY],pm);
    }
    public OnRespMove(msg : any) : void{
		//请求移动响应
		let resp : ProtocolDefine.nGame.nLianQi.msgLianQiRespMove = msg;

		if (resp.flag != ProtocolDefine.nGame.nLianQi.eGameOpRespFlag.SUCCESS) {
			//不成功
			//根据具体值给予错误提示
            Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.ACTION_FAIL],GameEvent.EVENT.MOVE);
			return;
		}

		let pm : GameEvent.IPlayOrMove = {
            isAI : false,
            isMove : true,
            local : nRoom.Room.getLocalBySeat(resp.seat),
            chessList : resp.moveList
        }

        Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_MOVE],pm);
	}

    public OnLQResult(msg : any) : void{
		//结算
		let resp : ProtocolDefine.nGame.nLianQi.msgLianQiResult = msg;

        let gameResult : Array<GameEvent.IGameResult> = [];
		for (var i = 0; i < resp.result.length; i++) {
			let player : nRoom.Player | null = nRoom.Room.getPlayerBySeat(resp.result[i].seat);

			if (player == null)
				//error
				return;

			let  gr : GameEvent.IGameResult = {
                seat : resp.result[i].seat,
                isOwner : player.isOwner,
                head : player.head,
                name : player.name,
                area : resp.result[i].area,
                kill : resp.result[i].kill,
                score : resp.result[i].score,
                multi : resp.result[i].multi,
                hasAbandon : resp.result[i].hasAbandon
            }
			gameResult.push(gr);

			//暂时在此处进行修改用户金币信息，后续新增更新用户基本信息消息
			if (gr.seat == nRoom.Room.selfSeat) {
				nAccount.Account.updateUserGold( gr.score - nRoom.Room.baseScore * resp.result[i].multi);
			}
        }
        
		//游戏结果，较为复杂，待实现
		let result : GameEvent.IShowGameResult = {
            roomType : nRoom.Room.roomType,
            level : nRoom.Room.roomLevel,
            baseScore : nRoom.Room.baseScore,
            poolGold : resp.poolGold,
            gameResult : gameResult
        };

        Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_RESULT],result);
    }
    public OnLQTurn(msg : any) : void{
		//该谁落子
		let resp : ProtocolDefine.nGame.nLianQi.msgLianQiTurn = msg;

		nGame.Game.currentTurn = resp.seat;
        this.updateBanDirs(resp.lmt);//添加禁用方向
        let banDirList : Array<number> = [];
		for (var i = 0; i < resp.lmt.length; i++) {
			banDirList.push(resp.lmt[i]);
		}

		let st : GameEvent.IShowTurn = {
            isPassTurn : resp.isPassTurn,
            isTimeOut : resp.isTimeOut,
            round : resp.round,
            local : nRoom.Room.getLocalBySeat (resp.seat),
            banDirList : banDirList
        }

        Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_TURN],st);
    }
    public OnLQAbandonPass(msg : any) : void{
		let resp : ProtocolDefine.nGame.nLianQi.msgLianQiAbandonPass = msg;

        Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_ABANDON_PASS],
            nRoom.Room.getLocalBySeat(resp.seat));
	}
	public OnLQAbandon(msg : any) : void {
		let resp : ProtocolDefine.nGame.nLianQi.msgLianQiRespAbandon = msg;
		if (resp.seat != nRoom.Room.selfSeat) {
            Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_ABANDON],
                nRoom.Room.getLocalBySeat(resp.seat));
		} else {
			//自己投降的响应
			nRoom.Room.setHasAbandon();
        }
    }

    //机器人落子
    public OnAIPlay(play : GameEvent.IPlay,seat : number) : void{
        if(!nGame.Game.isAI) return;
        
        let chees : ProtocolDefine.nGame.nLianQi.Chess = {
            x : play.x,
            y : play.y,
            direction : play.direction,
            playerID : seat
        };
        let chessList : Array<ProtocolDefine.nGame.nLianQi.Chess> = [];
        chessList.push(chees);
		let pm : GameEvent.IPlayOrMove = {
            isAI : true,
            isMove : false,
            local : nRoom.Room.getLocalBySeat(seat),
            chessList : chessList
        }
        //禁用机器人落子方向
        this.AIBanDir(play.direction);

        Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_PLAY],pm);

        //模拟器交互，延时操作
        Utils.getGlobalController()?.DelayCallback(()=>{
            //是否达到最大回合数，是则结束游戏
            if(this.AICheckLmtRoundEndGame()) return;
            //机器人落子，直接结束回合
            //也可触发移动操作 -- 这样的话需要增加AI_MOVE
            this.OnLQTurn({seat : nRoom.Room.selfSeat,
                isPassTurn : true,
                isTimeOut : false,
                round : nGame.Game.getRoundNum(),
                lmt : nGame.Game.banDirs});
        });
    }

    //---------------------------
	private showDialog(tip : string){
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
    private checkSelfTurn() : boolean{
		return nGame.Game.currentTurn == nRoom.Room.selfSeat;
    }
    //
    private updateBanDirs(banDirList : Array<ProtocolDefine.nGame.nLianQi.eLianQiDirectionType>) : void{
        nGame.Game.banDirs = [];
        for (var i = 0; i < banDirList.length; i++) {
			if (banDirList[i] != -1) {
                let d : ProtocolDefine.nGame.nLianQi.eLianQiDirectionType = banDirList[i];
                nGame.Game.banDirs.push(d);
			}
		}
    }
    //单机模式时，手动添加记录禁用方向--固定为2禁手
    private AIBanDir(dir : ProtocolDefine.nGame.nLianQi.eLianQiDirectionType){
		let d : ProtocolDefine.nGame.nLianQi.eLianQiDirectionType = dir;
		let index : number = nGame.Game.banDirs.indexOf(d);
        if(index != -1){//存在则先删除
            nGame.Game.banDirs.splice(index,1);
		}else{  //不存在只能是禁用方向
			if(nGame.Game.banDirs.length >= 2){
                nGame.Game.banDirs.splice(0,1);//删除第一个
            }
        }
        nGame.Game.banDirs.push(d);
    }
    public AICheckLmtRoundEndGame() : boolean{
        if(nGame.Game.getRoundNum() >= nRoom.Room.roomRule.lmtRound){
            let area0 = nGame.Game.getPlayerChessNum(0);
            let area1 = nGame.Game.getPlayerChessNum(1);
            let score0 = 0,score1 = 0;
            if(area0 > area1){
                score0 = 1000;
            }else{
                score1 = 1000;
            }
            //结束游戏
            let gr0 : ProtocolDefine.nGame.nLianQi.GameResult = {
                seat : 0,
                area : area0,//领地
				kill : 0,//消灭
				score : score0,//得分
			  	multi : 1,//倍率
				hasAbandon : false,//是否投降了
            };
            let gr1 : ProtocolDefine.nGame.nLianQi.GameResult = {
                seat : 1,
                area : area1,//领地
				kill : 0,//消灭
				score : score1,//得分
			  	multi : 1,//倍率
				hasAbandon : false,//是否投降了
            };

            let msg : ProtocolDefine.nGame.nLianQi.msgLianQiResult = {
                poolGold : 1000,
                result : [gr0,gr1],
                type : []
            };
            this.OnLQResult(msg);
            return true;
        }

        return false;
    }
}