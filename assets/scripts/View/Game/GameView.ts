// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node, ScrollView, Prefab, AudioSource, AudioClip, resources, Label, Vec3, UITransform, Game, Button, instantiate } from 'cc';
import { eDialogBtnType, eDialogEventType, IDialog } from '../../Common/Dialog';
import { CommonDefine } from '../../Define/CommonDefine';
import { ProtocolDefine } from '../../Define/ProtocolDefine';
import { GameEvent } from '../../Event/GameEvent';
import { RoomEvent } from '../../Event/RoomEvent';
import { nRoom } from '../../Model/Room';
import { NetwokState } from '../../Utils/NetwokState';
import { Utils } from '../../Utils/Utils';
import { Action } from './Action';
import { GamePlayer } from './GamePlayer';
import { GameResult } from './GameResult';
import { LianQi } from './LianQi';
const { ccclass, property } = _decorator;

@ccclass('GameView')
export class GameView extends NetwokState {
    @property(LianQi)
    public  lianQi! : LianQi;
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

    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
    onEnable(){
        super.onEnable();
		this.lianQi.node.active = false;
		this.action.node.active = false;
		//_playerInfoPanel.SetActive (false);
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

        Utils.getGlobalController()?.OnNotifyStartGame(true);
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
        Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_ROOMRULE],
            this.onUpdateRoomRule.bind(this),this);
        Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.PLAER_ENTER],
            this.onPlayerEnter.bind(this),this);
        Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_PLAER_STATE],
            this.onPlayerState.bind(this),this);
        Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.SHOW_TALK_MSG],
            this.onShowTalkMsg.bind(this),this);
        Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_LEAVE_ROOM],
            this.onPlayerLeave.bind(this),this);

        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.SHOW_GAME_START],
            this.onShowGameStart.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.SHOW_DRAW],
            this.onReqDraw.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.SHOW_DRAW_RESULT],
            this.onRespDraw.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.SHOW_TURN],
            this.onShowTurn.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.SHOW_ABANDON],
            this.onShowAbandon.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.SHOW_PASS],
            this.onShowPass.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.SHOW_ABANDON_PASS],
            this.onShowAbandonPass.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.SHOW_PLAY],
            this.onShowPlay.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.SHOW_MOVE],
            this.onShowMove.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.SHOW_RESULT],
            this.onShowResult.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.SHOW_FLAG],
            this.onShowFlag.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.SHOW_LIANQI],
            this.onShowLianQi.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.TO_GAMEVEIW_UPDATE_SCORE],
            this.onUpdateScore.bind(this),this);
    }
    private removeAllEvent() : void{
        Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_ROOMRULE],
            this.onUpdateRoomRule.bind(this),this);
        Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.PLAER_ENTER],
            this.onPlayerEnter.bind(this),this);
        Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_PLAER_STATE],
            this.onPlayerState.bind(this),this);
        Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.SHOW_TALK_MSG],
            this.onShowTalkMsg.bind(this),this);
        Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_LEAVE_ROOM],
            this.onPlayerLeave.bind(this),this);

        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.SHOW_GAME_START],
            this.onShowGameStart.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.SHOW_DRAW],
            this.onReqDraw.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.SHOW_DRAW_RESULT],
            this.onRespDraw.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.SHOW_TURN],
            this.onShowTurn.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.SHOW_ABANDON],
            this.onShowAbandon.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.SHOW_PASS],
            this.onShowPass.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.SHOW_ABANDON_PASS],
            this.onShowAbandonPass.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.SHOW_PLAY],
            this.onShowPlay.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.SHOW_MOVE],
            this.onShowMove.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.SHOW_RESULT],
            this.onShowResult.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.SHOW_FLAG],
            this.onShowFlag.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.SHOW_LIANQI],
            this.onShowLianQi.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.TO_GAMEVEIW_UPDATE_SCORE],
            this.onUpdateScore.bind(this),this);
    }

    	//----------------------------以下是界面事件发送-----------------------------
	public OnDrawBtn() : void{
        Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.DRAW]);
	}
	public OnAbandonBtn() : void {
        let dlg : IDialog = {
            type : eDialogEventType.GAME_ABANDON,
            tip : "你向对手举起了白旗，是否真的要<size=60><color=green>投降</color></size>？",
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
    
    //-------------------网络消息，刷新界面--------------------------------------
	public onShowTalkMsg(local : number,content : string) : void{		
		this._players[local]?.showChatMsg (this._chatMsg[Number(content)]);
		//播放声音
		this.playTalkSnd(Number(content));
    }
    
    public onUpdateRoomRule(rr : RoomEvent.IUpdateRoomRule){
		this._roomRule = rr;
		let rule : Label = this.gameRule.getComponentInChildren(Label)!;

		let text : string = "";
		text += this._roomRule.playerNum + "人 ";
        text += this._roomRule.gridLevel + "阶 ";
        let modeStr : string = Utils.getModeStr(this._roomRule.type,this._roomRule.playerNum,this._roomRule.gridLevel);

		if (this._roomRule.type == ProtocolDefine.nRoom.eCreateRoomType.ROOM_CLASSIC_PLAZA) {
			rule.string = modeStr + " 经典模式";
		} else if (this._roomRule.type == ProtocolDefine.nRoom.eCreateRoomType.ROOM_PLAZA){
			rule.string = modeStr + " " + this._roomRule.plazaName;
		}else if (this._roomRule.type == ProtocolDefine.nRoom.eCreateRoomType.ROOM_ROOM){
			rule.string = modeStr + " 房间模式";
		}else if (this._roomRule.type == ProtocolDefine.nRoom.eCreateRoomType.ROOM_TEAM){
			rule.string = modeStr + " 组队模式";
		}

		///this.lianQi.node.active =  true; -- show game start的时候在显示？

		//初始化联棋界面
		this.lianQi.onInit(rr);
    }
    //更新玩家当前棋子数
	public onUpdateScore(score : Array<number>) : void{
		for (var i = 0; i < this._players.length; i++) {
			if (this._players[i] != null) {
				this._players[i]!.updateScore(score[i]);
			}
		}
	}
    public onPlayerEnter(player : nRoom.Player) : void{
		let local : number = nRoom.RoomData.getLocalBySeat(player.seat) ;
		if (this._players[local] != null) {
			this._players[local]!.node.destroy();
			this._players[local] = null;
		}

		this._players[local] = this.createPlayer(player);

		if (this._roomRule.playerNum == 2) {
			//对家跳到下家位置
			if(local == nRoom.eSeatType.TOP){
				this._players[local]!.node.position = this.node.getChildByName("PlayerInfoPanel/Player" + nRoom.eSeatType.RIGHT)!.position;
			}
		} else if (this._roomRule.playerNum == 3) {
			//上家位置调到对家
			if(local == nRoom.eSeatType.LEFT){
				this._players[local]!.node.position = this.node.getChildByName("PlayerInfoPanel/Player" + nRoom.eSeatType.TOP)!.position;	
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
	public onPlayerLeave(local : number) : void{
		if (this._players[local] != null) {
			this._players[local]!.node.destroy();
			this._players[local] = null;
		}
	}
    public onShowGameStart(seat : number) : void{
		// 对局开始
		this.lianQi.node.active = true;
		this.action.node.active = true;
		//顶部按钮可以点击了
		this.enableTopBarButton(true);
		//设置先手
		this.lianQi.onUpdateFirstHandSeat(seat);
		this.action.onUpdateFirstHandSeat(seat);
		this.action.onInitActionPanel(this._roomRule);
	}
	public onReqDraw(data : any) : void{
        //请求和棋
	}
	public onRespDraw(data : any) : void{
        //请求和棋的响应
    }
    public onShowTurn(st : GameEvent.IShowTurn) : void{
		//通知action panel
		this.action.onShowTurn(st);
		this.lianQi.onLQShowTurn(st);
	}
	public onShowPass(local : number) : void{
		this.action.onShowPass(local);
		this.lianQi.onLQShowPass(local);
	}
	public onShowAbandonPass(local : number) : void{
		this.lianQi.onShowAbandonPass(local);
		this.action.onShowAbandonPass(local);
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
	public onShowPlay(pm : GameEvent.IPlayOrMove) : void{
		//通知action panel
		this.action.onShowPlay(pm);
		this.lianQi.onLQShowPlay(pm);
	}
	public onShowMove(pm : GameEvent.IPlayOrMove) : void{
		this.action.onShowMove(pm);
		this.lianQi.onLQShowMove(pm);
	}

	public onShowResult(gr : GameEvent.IShowGameResult) : void{
		//其他面板是否也需要处理？
		this.gameResult.showGameResult(gr);
    }
    //标致，重连等
	public onShowFlag(data : any) : void{
		
	}
	public onShowLianQi(cb : Array<ProtocolDefine.nGame.nLianQi.Chess>) : void{
		this.lianQi.onShowLianQi(cb);
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
			if (btns[i].name == "HintBtn"
				|| btns[i].name == "AbandonBtn") {
				btns[i].interactable = enable;
			}
		}
	}
	public createPlayer(data : nRoom.Player) : GamePlayer{
        let local : number = nRoom.RoomData.getLocalBySeat(data.seat);

		let n : Node = instantiate(this.gamePlayerPrefab);
		let player : GamePlayer = n.getComponent(GamePlayer)!;

        player.node.setParent(this._players[local]!.node);

		let self : boolean = nRoom.RoomData.getLocalBySeat(data.seat) == nRoom.eSeatType.SELF;
		player.updatePlayer(self,data.isOwner,data.seat,data.head,data.sex,data.name);

		//位置根据local来
		player.node.position = this.node.getChildByName("PlayerInfoPanel/Player" + nRoom.RoomData.getLocalBySeat(data.seat))!.position;
		return player;
	}

	public onClickDialogBtn(btn : eDialogBtnType,type : eDialogEventType) : void{
		if (btn == eDialogBtnType.DIALOG_BTN_OK) {
            Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.ABANDON]);
		}
	}    
}
