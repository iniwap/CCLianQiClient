// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Node, ScrollView, Prefab, AudioSource, AudioClip, resources, Label, Vec3, UITransform, Button, instantiate, RichText, tween } from 'cc';
import { eDialogBtnType, eDialogEventType, IDialog } from '../../Common/Dialog';
import { CommonDefine } from '../../Define/CommonDefine';
import { ProtocolDefine } from '../../Define/ProtocolDefine';
import { GameEvent } from '../../Event/GameEvent';
import { RoomEvent } from '../../Event/RoomEvent';
import { nGame } from '../../Model/Game';
import { nLobby } from '../../Model/Lobby';
import { nRoom } from '../../Model/Room';
import { NetworkState } from '../../Utils/NetworkState';
import { Utils } from '../../Utils/Utils';
import { Action } from './Action';
import { GamePlayer } from './GamePlayer';
import { GameResult } from './GameResult';
const { ccclass, property } = _decorator;

@ccclass('GameView')
export class GameView extends NetworkState {
    @property(Action)
    public action! : Action;
    @property(GameResult)
    public gameResult! : GameResult;
    
    @property(Node)
    public gameRule! : Node;
    @property(Node)
    public topMenu! : Node;
    
    @property(ScrollView)
    public  chatPanel! : ScrollView;
    
    @property(Node)
    public playerInfoPanel! : Node;
    @property(Node)
    public playerRoot : Array<Node> = [];
    private _players : Array<GamePlayer | null> = [];
    
    @property(Prefab)
    public gamePlayerPrefab! : Prefab;//GamePlayer
    
    @property(AudioSource)
	public audioSource! : AudioSource;

    private _roomRule! : RoomEvent.IUpdateRoomRule;

    private _chatMsg : Array<string> = ["先下手围墙！",
    "承让承认",
    "大哥，手下留情啊！",
    "瞧，乌龟都睡着了！",
    "哈哈哈哈哈哈哈",
    "你苏定了！",
    "不要走，决战到天亮"];

    @property(Node)
    public opTips! : Node;
    
    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
    onEnable(){
        super.onEnable();
		this.chatPanel.node.active = false;
		this.gameResult.node.active = false;

		//投降和切换棋子信息不能点击
		this.enableTopBarButton(false);

		for(var i = 0;i<this._players.length;i++){
			if (this._players[i] != null) {
				this._players[i]!.node.destroy();
			}
			this._players[i] = null;
		}

		this.addAllEvent ();
        this.UpdateUI();
        Utils.getGlobalController()?.OnNotifyStartGame(true);//此处最好是游戏所有初始化完成再通知服务器
    }

    onDisable(){
        super.onDisable();
        this.removeAllEvent();
		//清除动态生成的内容
		for(var i = 0;i < this._players.length;i++){
			if (this._players[i] != null) {
				this._players[i]!.node.destroy();
				this._players[i] = null;
			}
		}
    }

    private addAllEvent() : void{
        Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.SHOW_TALK_MSG],
            this.onShowTalkMsg.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.SHOW_ABANDON],
            this.onShowAbandon.bind(this),this);

        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.SHOW_GAME_START],
            this.onShowGameStart.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.SHOW_DRAW],
            this.onReqDraw.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.SHOW_DRAW_RESULT],
            this.onRespDraw.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.SHOW_RESULT],
            this.onShowResult.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.SHOW_FLAG],
            this.onShowFlag.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.TO_GAMEVEIW_UPDATE_SCORE],
            this.onUpdateScore.bind(this),this);

        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.SHOW_OP_TIPS],
            this.OnShowOpTips.bind(this),this);
    }
    private removeAllEvent() : void{
        Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.SHOW_TALK_MSG],
            this.onShowTalkMsg.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.SHOW_ABANDON],
            this.onShowAbandon.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.SHOW_GAME_START],
            this.onShowGameStart.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.SHOW_DRAW],
            this.onReqDraw.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.SHOW_DRAW_RESULT],
            this.onRespDraw.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.SHOW_RESULT],
            this.onShowResult.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.SHOW_FLAG],
            this.onShowFlag.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.TO_GAMEVEIW_UPDATE_SCORE],
            this.onUpdateScore.bind(this),this);

        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.SHOW_OP_TIPS],
            this.OnShowOpTips.bind(this),this);
    }

    //----------------------------以下是界面事件发送-----------------------------
    public OnAICloseBtnClick() : void{
        //退出返回大厅，显示结算？不需要似乎
        Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.LEAVE_ROOM],true);
    }
	public OnDrawBtn() : void{
        Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.DRAW]);
	}
	public OnAbandonBtn() : void {
        let dlg : IDialog = {
            type : eDialogEventType.GAME_ABANDON,
            tip : "你向对手举起了白旗，是否真的要<size=60><color=#00ff00>投降</color></size>？",
            hasOk : true,
            okText : "投降",
            hasCancel : true,
            cancelText : "取消",
            hasClose : false,
            closeText : "",
            callBack : this.onClickDialogBtn.bind(this)
        };
        this.OnShowDialog(dlg);
	}
	public OnPlayerClickSendChatBtn(event : any,chatID : string) : void{
        Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.TALK_MSG],chatID);
		//关闭聊天窗口
		this.chatPanel.node.active = false;
	}
	public OnClickOpenChatPanel() : void{
		this.chatPanel.node.active = !this.chatPanel.node.active;
	}

	//棋子生命值显示等
	public OnClickHintBtn() : void{
        Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.TO_LQP_SWITCH_HINT]);
    }
    public OnShowOpTips(op : GameEvent.IShowOpTips) : void{
        if(this.opTips.active == op.show) return;//已经在显示，不执行操作。已经隐藏，不执行隐藏
        tween(this.opTips).stop();
        this.opTips.active = true;
        if(op.show){
            //只有显示才修改文字内容
            this.opTips.getComponentInChildren(RichText)!.string = op.content;
            this.opTips.position = new Vec3(0,100,0);
            if(op.autoHide){
                tween(this.opTips)
                .delay(0.01)
                .to(0.5, { position: new Vec3(0, 0, 0) })
                .delay(3)
                .to(0.5, { position: new Vec3(0, 100, 0)},{onComplete: (target?: object) => {
                    this.opTips.active = false;
                }})
                .start();
            }else{
                tween(this.opTips)
                .delay(0.01)
                .to(1, { position: new Vec3(0, 0, 0) })
                .start();
            }
        }else{
            this.opTips.position = new Vec3(0,0,0);//
            tween(this.opTips)
            .delay(0.01)
            .to(0.5, { position: new Vec3(0, 100, 0)},{onComplete: (target?: object) => {
                this.opTips.active = false;
            }})
            .start();
        }
    }
    //-------------------刷新界面，数据已经收到----------------------------------
    public UpdateUI(){
        this.opTips.active = false;
        this.opTips.position = new Vec3(0,100,0);

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
        this.onUpdateRoomRule(rr);
        let players : Array<nRoom.Player> = nRoom.Room.getAllPlayers();
        for(var i = 0;i < players.length;i++){
            this.onPlayerEnter(players[i]);
            //所有人设置为游戏中
            this.onPlayerState(nRoom.Room.getLocalBySeat(players[i].seat),players[i].state);
        }

        let topBtns : Array<Button> = this.topMenu.getComponentsInChildren(Button);
        for(let btn of topBtns){
            if (btn.name.indexOf("HintBtn") != -1
                || btn.name.indexOf("AbandonBtn") != -1
                || btn.name.indexOf("ChatBtn") != -1) {
                btn.node.active = !nGame.Game.isAI;
            }else if(btn.name.indexOf("BackBtn") != -1){
                btn.node.active = nGame.Game.isAI;
            }
        }
    }
    public onUpdateRoomRule(rr : RoomEvent.IUpdateRoomRule){
		this._roomRule = rr;
		let rule : Label = this.gameRule.getComponentInChildren(Label)!;
        let modeStr : string = Utils.getModeStr(this._roomRule.type,this._roomRule.playerNum,this._roomRule.gridLevel);

		if (this._roomRule.type == ProtocolDefine.nRoom.eCreateRoomType.ROOM_CLASSIC_PLAZA) {
			rule.string = modeStr + " 经典模式";
		} else if (this._roomRule.type == ProtocolDefine.nRoom.eCreateRoomType.ROOM_PLAZA){
			rule.string = modeStr + " " + this._roomRule.plazaName;
		}else if (this._roomRule.type == ProtocolDefine.nRoom.eCreateRoomType.ROOM_ROOM){
			rule.string = modeStr + " 房间模式";
		}else if (this._roomRule.type == ProtocolDefine.nRoom.eCreateRoomType.ROOM_TEAM){
			rule.string = modeStr + " 组队模式";
        }else{
            rule.string = modeStr + " 单机模式";
        }
        
		//初始化联棋界面
		this.action.onInit(this._roomRule);
    }
    public onPlayerEnter(player : nRoom.Player) : void{
		let local : number = nRoom.Room.getLocalBySeat(player.seat) ;
		if (this._players[local] != null) {
			this._players[local]!.node.destroy();
			this._players[local] = null;
		}

		this._players[local] = this.createPlayer(player);

		if (this._roomRule.playerNum == 2) {
			//对家跳到下家位置
			if(local == nRoom.eSeatType.TOP){
				this._players[local]!.node.setPosition(this.playerRoot[nRoom.eSeatType.RIGHT].position);
			}
		} else if (this._roomRule.playerNum == 3) {
			//上家位置调到对家
			if(local == nRoom.eSeatType.LEFT){
				this._players[local]!.node.setPosition(this.playerRoot[nRoom.eSeatType.TOP].position);
			}
		}

		if(local != nRoom.eSeatType.SELF){
			let prep : Vec3 = this._players[local]!.node.position;
			let offset : number = this._players[local]!.node.getComponent(UITransform)!.contentSize.width/2/0.75*0.125;
            this._players[local]!.node.setPosition(prep.x - offset,prep.y,0.0);
		}
    }
    public onPlayerState(local : number,state : ProtocolDefine.nRoom.eStateType) : void{
		this._players[local]!.updateState(state);
    }
    //游戏中不能逃跑
    // public onPlayerLeave(local : number) : void{
	// 	if (this._players[local] != null) {
	// 		this._players[local]!.node.destroy();
	// 		this._players[local] = null;
	// 	}
	// }
    //-------------------网络消息，刷新界面--------------------------------------
	public onShowTalkMsg(local : number,content : string) : void{		
		this._players[local]?.showChatMsg (this._chatMsg[Number(content)]);
		//播放声音
		this.playTalkSnd(Number(content));
    }
    
    //更新玩家当前棋子数
	public onUpdateScore(score : Array<number>) : void{
		for (var i = 0; i < this._players.length; i++) {
			if (this._players[i] != null) {
				this._players[i]!.updateScore(score[i]);
			}
		}
	}
    public onShowGameStart(seat : number) : void{
		// 对局开始
		//顶部按钮可以点击了
		this.enableTopBarButton(true);
		//设置先手
		this.action.onUpdateFirstHandSeat(seat);
	}
	public onReqDraw(data : any) : void{
        //请求和棋
	}
	public onRespDraw(data : any) : void{
        //请求和棋的响应
    }
	public onShowAbandon(local : number) : void{
        let dlg : IDialog = {
            type : eDialogEventType.GAME_ABANDON,
            tip : this._players[local]!.getPlayerName() + "投降了！投降了！投降了！",
            hasOk : false,
            okText : "",
            hasCancel : false,
            cancelText : "",
            hasClose : true,
            closeText : "关闭",
            callBack : ()=>{}
        };
        this.OnShowDialog(dlg);
    }
    public onShowResult(gr : GameEvent.IShowGameResult) : void{
		//其他面板是否也需要处理？
		this.gameResult.showGameResult(gr);
    }
    //标致，重连等
	public onShowFlag(data : any) : void{
		
    }
    
    //--------------------------------------------------------
    public playTalkSnd(index : number) : void{
        if (Utils.getPlayerPrefs(CommonDefine.SETTING_EFF_SNF,"1") != "1")
            return;

        let talk : Array<string> = [
            "先下手",
            "承让承让",
            "大哥手下留情啊",
            "乌龟睡咪咪",
            "wahahahaha",
            "你苏定了",
            "不要走"
        ];

        resources.load(CommonDefine.ResPath.GAME_TALK_SND + talk[index],AudioClip,(err,ac)=>{
            this.audioSource.clip = ac!;
            this.audioSource.play();
        });
    }
    public enableTopBarButton(enable : boolean) : void{
		let btns : Array<Button> = this.topMenu.getComponentsInChildren(Button);
		for (var i = 0; i < btns.length; i++) {
			if (btns[i].name.indexOf("HintBtn") != -1
                || btns[i].name.indexOf("AbandonBtn") != -1
                || btns[i].name.indexOf("ChatBtn") != -1) {
				btns[i].interactable = enable;
			}
		}
	}
	public createPlayer(data : nRoom.Player) : GamePlayer{
        let local : number = nRoom.Room.getLocalBySeat(data.seat);

		let n : Node = instantiate(this.gamePlayerPrefab);
		let player : GamePlayer = n.getComponent(GamePlayer)!;

        player.node.setParent(this.playerInfoPanel);

		let self : boolean = nRoom.Room.getLocalBySeat(data.seat) == nRoom.eSeatType.SELF;
        player.updatePlayer(self,data.isOwner,data.seat,data.head,data.sex,data.name);
        player.node.setPosition(this.playerRoot[local].position);

		return player;
	}

	public onClickDialogBtn(btn : eDialogBtnType,type : eDialogEventType) : void{
		if (btn == eDialogBtnType.DIALOG_BTN_OK) {
            Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.ABANDON]);
		}
	}    
}
