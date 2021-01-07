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
const { ccclass, property } = _decorator;

export enum eActionStep{
    STEP_NOT_TURN,
    STEP_PLAY,
    STEP_WAIT_PLAY_RESULT,
    //STEP_MOVE_OR_PASS,
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

	private _lmtTurnTime : number = 0;
	private _leftTime : number = 0;

    private _currentStep : eActionStep = eActionStep.STEP_NOT_TURN;

    start () {
        // Your initialization goes here.
    }

    onEnable(){
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.ACTION_FAIL],
            this.onActionFail.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.CLOCK],
			this.onShowClock.bind(this),this);
    }

    onDisable(){
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.ACTION_FAIL],
            this.onActionFail.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.CLOCK],
			this.onShowClock.bind(this),this);
    }
    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

	//----------------------------界面事件发出----------------------------
	public OnMoveBtn() : void{
		//不在move(即可以pass阶段)步骤，不能移动
		/*
		if (_currentStep != eActionStep.STEP_MOVE_OR_PASS) {
			return;
		}
		*/
		if (this._currentStep != eActionStep.STEP_PASS) {
			return;
		}

        Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.ACTION_MOVE],null);
		this.setCurrentStep(eActionStep.STEP_WAIT_MOVE_RESULT);
    }
    public  OnPassBtn(event : any) : void{
		this.btnPass.interactable  = false;

		// 这里需要判断当前处于哪个阶段来决定是落子还是结束回合
		//不在play步骤，不能落子
		if (this._currentStep == eActionStep.STEP_PLAY) {
            Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.ACTION_PLAY],null);
			this.setCurrentStep (eActionStep.STEP_WAIT_PLAY_RESULT);
			return;
		}else if (this._currentStep == eActionStep.STEP_PASS) {
            Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.ACTION_PASS],null);
			this.setCurrentStep (eActionStep.STEP_WAIT_PASS_RESULT);
			return;
		}/*else if (_currentStep == eActionStep.STEP_MOVE_OR_PASS) {

			GameEvent.EM().InvokeEvent(GameEvent.EVENT.ACTION_MOVE,null);
			_currentStep = eActionStep.STEP_WAIT_MOVE_RESULT;

			return;
		}
		*/
    }
    //-----------------------------接收消息处理------------------------
	public onInitActionPanel(rr : RoomEvent.IUpdateRoomRule) : void{
		this.round.string = "回合 1" + "/" + rr.lmtRound;

		this.round.node.active = false;

		this._lmtTurnTime = rr.lmtTurnTime;
		this._leftTime = this._lmtTurnTime;
		if (this._lmtTurnTime == 0) {
			//不限制每手时长
			this.clock.node.active = false;
		}

		this.setCurrentStep (eActionStep.STEP_NOT_TURN);
    }
    public onShowAbandonPass(local : number) : void{

    }
    public onShowPass(local : number) : void{
		//string lmtRound = CommonUtil.Util.split(_round.text,'/')[1];
		let currentRound : string = this.round.string.split('/')[0];
		currentRound =currentRound.split(' ')[1];
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
    }
    public showTurn(isPass : boolean,st : GameEvent.IShowTurn) : void{
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

		} else {
			this.btnPass.interactable = false;
		}

		this.setPassBtnTxt("Play");

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

		if (this._lmtTurnTime != 0) {
            this.unschedule(this.updateClock);
			this._leftTime = this._lmtTurnTime;// 重置限手时间

			this.schedule(this.updateClock, 1);
		}
    }
    
    public onShowTurn(st : GameEvent.IShowTurn) : void{
		this.showTurn(false,st);
	}
	public onShowMove(data : any) : void{
		this.setCurrentStep (eActionStep.STEP_PASS);
	}
	public onShowPlay(pm : GameEvent.IPlayOrMove) : void{
		if (pm.local == nRoom.eSeatType.SELF) {
			this.btnPass.interactable = true;
		}

		//落子之棋盘不能操作，无论是否是自己
		for (var i = 0; i < 6; i++) {
			this.banDir (true,i);
		}

		this.setPassBtnTxt("Pass");

		this.setCurrentStep(eActionStep.STEP_PASS);
	}

	public onActionFail(data : GameEvent.EVENT) : void{ 
		switch (data) {
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
			//_currentStep = eActionStep.STEP_MOVE_OR_PASS;
			this.setCurrentStep(eActionStep.STEP_PASS);
			break;
		}

        Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.TO_LQP_ACTION_FAIL],data);
	}

	public onShowClock(local : number,leftTime : number,step : number) : void{
		//来自服务器的思考倒计时，这里直接客户端实现，不采用服务端的
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
    public updateClock() : void{

		this.clock.string = ""+ this._leftTime + "s";
		//通知lq panel
        Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.TO_LQP_CLOCK],this._leftTime);

		if (this._leftTime == 0) {
			// 超时了
			//自动pass
            this.unschedule(this.updateClock);
			return;
		}

		--this._leftTime;
	}
	public updateRound(round : number) : void{
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
        Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.ACTION_BAN_DIR],ban,dir);
	}

	private setPassBtnTxt(txt : string) : void {        
        this.btnPass.getComponentInChildren(Label)!.string = txt;
	}
	private setCurrentStep(step : eActionStep) : void{

		this._currentStep = step;
        Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.ACTION_STEP],this._currentStep);
	}
}
