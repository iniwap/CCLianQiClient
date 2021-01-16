// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node, Label, Button, SpriteFrame, resources, Sprite, Game } from 'cc';
import { nRoom } from '../../Model/Room';
import { GameEvent } from '../../Event/GameEvent';
import { RoomEvent } from '../../Event/RoomEvent';
import { Utils } from '../../Utils/Utils';
import { CommonDefine } from '../../Define/CommonDefine';
import { LianQi } from './LianQi';
import { nGame } from '../../Model/Game';
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
    //-----------------------------接收消息处理------------------------
	public onInit(rr : RoomEvent.IUpdateRoomRule) : void{
		this.lianQi.node.active = true;
		this.node.active = true;

		this.round.string = "回合 1" + "/" + rr.lmtRound;

		this.round.node.active = false;
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
		}else{
			this.btnPass.interactable = false;
		}

		//落子之棋盘不能操作，无论是否是自己
		for (var i = 0; i < 6; i++) {
			this.banDir(true,i);
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

		for (var i = 0; i < 6; i++) {
			if (firstHand != nRoom.eSeatType.SELF) {
				this.banDir(true,i);
			}
		}
    }
    //------------------------封装------------------
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

        //设置按钮图为对应的出手方
        resources.load(CommonDefine.ResPath.LQ_PASS_BTN + nRoom.RoomData.getSeatByLocal(st.local) + "/spriteFrame",
            SpriteFrame, (err, spriteFrame) => {
                this.btnPass.getComponent(Sprite)!.spriteFrame = spriteFrame!;
                //spriteFrame.addRef();
        });
		if (st.local == nRoom.eSeatType.SELF) {
			this.btnPass.interactable = true;

			for (var i = 0; i < 6; i++) {
				this.banDir(false,i);
			}
			this.setPassBtnTxt("确定落子");

		} else {
			this.btnPass.interactable = false;
			this.setPassBtnTxt("等待回合");
		}

		if (!isPass) {
			//ON TURN
			//设置禁用方向
			for (var i = 0; i < st.banDirList.length; i++) {
				if (st.banDirList[i] != -1) {
					this.banDir(true, st.banDirList[i]);
				}
			}
		}

		if (st.isPassTurn) {
			this.updateRound (st.round);
		}
    }
    
}
