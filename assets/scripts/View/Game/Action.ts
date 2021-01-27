// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node, Label, Button, SpriteFrame, resources, Sprite, Game, math, tween, Vec3, Vec2 } from 'cc';
import { nRoom } from '../../Model/Room';
import { GameEvent } from '../../Event/GameEvent';
import { RoomEvent } from '../../Event/RoomEvent';
import { Utils } from '../../Utils/Utils';
import { CommonDefine } from '../../Define/CommonDefine';
import { LianQi } from './LianQi';
import { nGame } from '../../Model/Game';
import { ProtocolDefine } from '../../Define/ProtocolDefine';
const { ccclass, property } = _decorator;

export enum eActionStep{
    STEP_NOT_TURN,
    STEP_PLAY,
    STEP_WAIT_PLAY_RESULT,
    STEP_MOVE_OR_PASS,
    STEP_WAIT_MOVE_RESULT,
    STEP_PASS,
    STEP_WAIT_PASS_RESULT,
};

@ccclass('Action')
export class Action extends Component {
    @property(Label)
    public clock! : Label;
    @property(Label)
    public round! : Label;
    @property(Button)
	public btnPass! : Button;

	private _currentStep : eActionStep = eActionStep.STEP_NOT_TURN;
	
	@property(LianQi)
	public lianQi! : LianQi;

	@property(Node)
	public directionPanel! : Node;
	@property(Node)
	public dirs : Array<Node> = [];
	private _banDirs : Array<ProtocolDefine.nGame.nLianQi.eLianQiDirectionType> = [];

	@property(Sprite)
	public seatBG !: Sprite;
	@property(Sprite)
	public qiZi !: Sprite;

    start () {
        // Your initialization goes here.
    }

    onEnable(){
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.ACTION_FAIL],
            this.onActionFail.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.CLOCK],
			this.onShowClock.bind(this),this);
		Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.SHOW_TURN],
			this.onShowTurn.bind(this),this);
		Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.SHOW_PASS],
			this.onShowPass.bind(this),this);
		Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.SHOW_ABANDON_PASS],
			this.onShowAbandonPass.bind(this),this);
		Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.SHOW_PLAY],
			this.onShowPlay.bind(this),this);
		Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.SHOW_MOVE],
			this.onShowMove.bind(this),this);
		Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.SHOW_DIR_CHESS],
			this.onEventShowDirChess.bind(this),this);
		
		//棋子改变方向，通过actionpanel 处理
		Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.CHANGE_CHESS_DIR],
			this.onEventChangeChessDir.bind(this),this);
    }

    onDisable(){
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.ACTION_FAIL],
            this.onActionFail.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.CLOCK],
			this.onShowClock.bind(this),this);
		Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.SHOW_TURN],
			this.onShowTurn.bind(this),this);
		Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.SHOW_PASS],
			this.onShowPass.bind(this),this);
		Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.SHOW_ABANDON_PASS],
			this.onShowAbandonPass.bind(this),this);
		Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.SHOW_PLAY],
			this.onShowPlay.bind(this),this);
		Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.SHOW_MOVE],
			this.onShowMove.bind(this),this);
		Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.CHANGE_CHESS_DIR],
			this.onEventChangeChessDir.bind(this),this);
		Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.SHOW_DIR_CHESS],
			this.onEventShowDirChess.bind(this),this);
		this._banDirs = [];

    }
    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

	//----------------------------界面事件发出----------------------------
    public  OnStepBtn(event : any) : void{
		if(nRoom.RoomData.getHasAbandon()){
			//已经投降了，不能操作，原则上这个按钮不应该可以点击
			Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_OP_TIPS],
				{show : true,autoHide : true,content : "你已经投降了，不能执行该操作。"});
			return;
        }
		// 这里需要判断当前处于哪个阶段来决定是落子还是结束回合
		//不在play步骤，不能落子
		if (this._currentStep == eActionStep.STEP_PLAY) {
			if(!this.lianQi.getHaveTryPlayChess()){
				Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_OP_TIPS],
					{show : true,autoHide : true,content : "你没有点击空白棋格落子，将直接<b>结束回合</b>"});
				//直接视为pass
				if(this.lianQi.onActionPass()){
					this.btnPass.interactable  = false;
					this.setCurrentStep (eActionStep.STEP_WAIT_PASS_RESULT);
				}
			}else{
				if(this.lianQi.onActionPlay()){
					this.btnPass.interactable  = false;
					this.setCurrentStep (eActionStep.STEP_WAIT_PLAY_RESULT);
				}
			}
			return;
		}else if (this._currentStep == eActionStep.STEP_PASS) {
			if(this.lianQi.onActionPass()){
				this.btnPass.interactable  = false;
				this.setCurrentStep (eActionStep.STEP_WAIT_PASS_RESULT);
			}
			return;
		}else if (this._currentStep == eActionStep.STEP_MOVE_OR_PASS){
			if(!this.lianQi.getHaveMoveChess()){
				//提示有可移动棋子，但是没有移动
				Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_OP_TIPS],
					{show : true,autoHide : true,content : "有可以棋子，但是选择了跳过不移动，直接跳过回合。"});
				//直接视为pass
				if(this.lianQi.onActionPass()){
					this.btnPass.interactable  = false;
					this.setCurrentStep (eActionStep.STEP_WAIT_PASS_RESULT);
				}
				return;
			}
			//如果不选择不移动，则此步骤为pass步骤
			if(this.lianQi.onActionMove()){
				this.btnPass.interactable  = false;
				this.setCurrentStep(eActionStep.STEP_WAIT_MOVE_RESULT);
			}
			return;
		}
	}
	public onEventChangeChessDir(dir : ProtocolDefine.nGame.nLianQi.eLianQiDirectionType) : void{
		//原则上只需判断棋子调整时的方向，至于服务器落子时一定是可用的，没必要加这个判断
		if(this._banDirs.indexOf(dir) != -1){
			//该方向当前为禁用方向
			Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_OP_TIPS],
				{show : true,autoHide : false,content : "该方向为禁用方向，请继续调整其他可用方向。"});
			return;
		}

		//原则上这里应该是成功的
		if(this.lianQi.onEventChangeChessDir(dir)){
			//切换到这个方向成功，更新方向面板的显示
			this.updateDirChessDir(dir);
		}
	}
	public onEventShowDirChess(dir : ProtocolDefine.nGame.nLianQi.eLianQiDirectionType) : void {
		this.qiZi.node.active = true;
		this.updateDirChessDir(dir);
	}
    //-----------------------------接收消息处理------------------------
	public onInit(rr : RoomEvent.IUpdateRoomRule) : void{
		this.lianQi.node.active = true;
		this.node.active = true;

		this.round.string = "回合 1" + "/" + rr.lmtRound;

		this.round.node.active = false;
		this._banDirs = [];
		this.directionPanel.setScale(0,0);
		for(let dir of this.dirs){
			dir.getChildByName("DirSelected")!.active = false;
			dir.getChildByName("Dir")!.active = false;//用来展示当前切换到到方向
			dir.getChildByName("BanDir")!.active = true;//用来展示禁用-未禁用
			resources.load(CommonDefine.ResPath.LQ_DIRECTION_DIRECT + nRoom.RoomData.getSeatByLocal(nRoom.RoomData.selfSeat) + "/spriteFrame",
			SpriteFrame, (err, spriteFrame) => {
				dir.getChildByName("Dir")!.getComponent(Sprite)!.spriteFrame = spriteFrame!;
				//spriteFrame.addRef();
		});
		}

		if (rr.lmtTurnTime == 0) {
			//不限制每手时长
			this.clock.node.active = false;
		}

		this.setCurrentStep (eActionStep.STEP_NOT_TURN);

		this.lianQi.onInit(rr);
    }
    public onShowAbandonPass(local : number) : void{
		this.lianQi.onShowAbandonPass(local);
	}
	//结束回合成功
    public onShowPass(local : number) : void{
		let currentRound : string = this.round.string.split('/')[0];
		currentRound = currentRound.split(' ')[1];
        let round : number = Number(currentRound) + 1;//因为是自己点了pass，客户端自动＋1
        
		let st : GameEvent.IShowTurn = {
            local : local,
            isPassTurn : true,
            isTimeOut : false,
            round : round,
            banDirList : []
        };

		this.showTurn(true,st);

		//设置非自己轮
		this.setCurrentStep(eActionStep.STEP_NOT_TURN);

		this.lianQi.onLQShowPass(local);
	}
	//当前进入谁的回合
    public onShowTurn(st : GameEvent.IShowTurn) : void{
		this.showTurn(false,st);
		this.lianQi.onLQShowTurn(st);
	}
	//移动棋子成功
	public onShowMove(pm : GameEvent.IPlayOrMove) : void{
		this.setCurrentStep(eActionStep.STEP_PASS);
		if(this.lianQi.onLQShowMove(pm)){//仍有棋子可以移动
			this.setCurrentStep(eActionStep.STEP_MOVE_OR_PASS);
		}else{
			this.setCurrentStep(eActionStep.STEP_PASS);
		}
	}
	//落子成功
	public onShowPlay(pm : GameEvent.IPlayOrMove) : void{
		if (pm.local == nRoom.eSeatType.SELF) {
			this.btnPass.interactable = true;
			//自己落子的响应，原则上不需要更新方向盘
		}else{
			this.btnPass.interactable = false;
		}

		//执行落子逻辑，如果根据是否可以移动更新当前步骤
		if (this.lianQi.onLQShowPlay(pm)){
			if(pm.local == nRoom.eSeatType.SELF){
				this.setPassBtnTxt("确定移动");
			}
			this.setCurrentStep(eActionStep.STEP_MOVE_OR_PASS);
		}else{
			if(pm.local == nRoom.eSeatType.SELF){
				this.setPassBtnTxt("结束回合");
			}
			this.setCurrentStep(eActionStep.STEP_PASS);
		}
	}

	//操作失败--都不应该出现，否则基本上客户端-服务端数据不一致了
	public onActionFail(act : GameEvent.EVENT) : void{
		switch (act) {
		case GameEvent.EVENT.ABANDON:
			break;
		case GameEvent.EVENT.DRAW:
			break;
		case GameEvent.EVENT.PLAY:
			this.btnPass.interactable = true;
			this.setCurrentStep(eActionStep.STEP_PLAY);
			break;
		case GameEvent.EVENT.PASS:
			this.setCurrentStep(eActionStep.STEP_PASS);
			this.btnPass.interactable = true;
			break;
		case GameEvent.EVENT.MOVE:
			this.btnPass.interactable = true;
			this.setCurrentStep(eActionStep.STEP_MOVE_OR_PASS);
			break;
		}
		this.lianQi.onActionFail(act);
	}

	public onShowClock(sc : GameEvent.IUpdateClock) : void{
		//刷新倒计时
		if(sc.leftTime <= 0) return;//0的时候不显示了
		this.clock.string = ""+ sc.leftTime + "s";
	}

	public onUpdateFirstHandSeat(seat : number) : void{
		//开局所有方向可用
		let firstHand : number = nRoom.RoomData.getLocalBySeat(seat);
		this._banDirs = [];
		for (var i = 0; i < 6; i++) {
			this.banDir(false,i);
		}

		this.qiZi.node.active = false;
    }
	//------------------------封装------------------
	private updateDirChessDir(dir : ProtocolDefine.nGame.nLianQi.eLianQiDirectionType) : void{
		this.updateDirs(false);
		this.dirs[dir].getChildByName("DirSelected")!.active = true;
		this.dirs[dir].getChildByName("Dir")!.active = true;
		this.dirs[dir].getChildByName("BanDir")!.active = false;
		this.qiZi.node.setRotationFromEuler(0,0,-60 * dir);
	}
	private updateRound(round : number) : void{
		//更新回合数
		let lmtRound : number = Number(this.round.string.split('/')[1]);
		//不限制回合场，不显示回合提示
		if (lmtRound == 0)
			return;
		this.round.string = "回合 " + round + "/" + lmtRound;
		//最后10回合一直提示
		if (lmtRound - round <= 10) {
			//一直显示
			this.round.node.active = true;
		} else {
			if(round % 10 == 0){
				//每10个回合显示一次
				this.round.node.active = true;
			}else{
				this.round.node.active = false;
			}
		}
	}

	private banDir(ban : boolean,dir : number) : void{
		let d : ProtocolDefine.nGame.nLianQi.eLianQiDirectionType = dir;
		let index : number = this._banDirs.indexOf(d);
		if(index != -1){//存在只能是去禁用
			if(!ban){
				//去禁用方向
				this._banDirs.splice(index,1);
			}else{
				//重复操作，donth
			}
		}else{  //不存在只能是禁用方向
			if(ban){
				this._banDirs.push(d);
			}else{
				//多余操作，donth
			}
		}

		//事实上游戏逻辑不做处理
		this.lianQi.onActionBanDir(ban,dir);
	}
	private setPassBtnTxt(txt : string) : void {        
        this.btnPass.getComponentInChildren(Label)!.string = txt;
	}
	private setCurrentStep(step : eActionStep) : void{
		this._currentStep = step;
	}
	private showTurn(isPass : boolean,st : GameEvent.IShowTurn) : void{
		if (!isPass) {
			if (st.local == nRoom.eSeatType.SELF) {
				this.setCurrentStep (eActionStep.STEP_PLAY);
			} else {
				this.setCurrentStep (eActionStep.STEP_NOT_TURN);
			}
		}

		let seat : number = nRoom.RoomData.getSeatByLocal(st.local);
        //设置按钮图为对应的出手方
        resources.load(CommonDefine.ResPath.LQ_PASS_BTN + seat + "/spriteFrame",
            SpriteFrame, (err, spriteFrame) => {
                this.btnPass.getComponent(Sprite)!.spriteFrame = spriteFrame!;
                //spriteFrame.addRef();
        });

		this._banDirs = [];
		for (var i = 0; i < st.banDirList.length; i++) {
			if (st.banDirList[i] != -1) {
				this.banDir(true, st.banDirList[i]);
			}
		}
		//切换手不显示方向棋子，只有点击尝试落子后才显示
		this.qiZi.node.active = false;

		if (st.isPassTurn) {
			this.updateRound (st.round);
		}

		if (st.local == nRoom.eSeatType.SELF) {
			this.btnPass.interactable = true;
			this.setPassBtnTxt("确定落子");
			//只有轮到自己到时候才会显示方向盘
			this.updateDirs(true);
			tween(this.directionPanel)
            .to(0.5, { scale: new Vec3(1, 1, 1)}, { easing: 'backOut' })
            .start();

		} else {
			this.btnPass.interactable = false;
			this.setPassBtnTxt("等待回合");
			tween(this.directionPanel)
            .to(0.5, { scale: new Vec3(0, 0, 0)}, { easing: 'backIn' })
            .start();
		}
		
    }
    private updateDirs(changeTurn : boolean) : void{
		if(changeTurn){
			resources.load(CommonDefine.ResPath.LQ_DIRECTION_INFOBG + nRoom.RoomData.selfSeat + "/spriteFrame",
				SpriteFrame, (err, spriteFrame) => {
					this.seatBG.spriteFrame = spriteFrame!;
					//spriteFrame.addRef();
			});
			resources.load(CommonDefine.ResPath.CHESS + nRoom.RoomData.selfSeat + "/spriteFrame",
				SpriteFrame, (err, spriteFrame) => {
					this.qiZi.spriteFrame = spriteFrame!;
					//spriteFrame.addRef();
			});
		}
		for(let i = 0;i < 6;i++){
			this.dirs[i].getChildByName("DirSelected")!.active = false;
			this.dirs[i].getChildByName("Dir")!.active = false;//用来展示当前切换到到方向
			this.dirs[i].getChildByName("BanDir")!.active = true;//用来展示禁用-未禁用

			let c : math.Color = this.dirs[i].getChildByName("BanDir")!.getComponent(Sprite)!.color;
			this.dirs[i].getChildByName("BanDir")!.getComponent(Sprite)!.color = new math.Color(c.r,c.g,c.b,255);
		}
		for(let dir of this._banDirs){
			let c : math.Color = this.dirs[dir].getChildByName("BanDir")!.getComponent(Sprite)!.color;
			this.dirs[dir].getChildByName("BanDir")!.getComponent(Sprite)!.color = new math.Color(c.r,c.g,c.b,127);
		}
	}
}
