// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node } from 'cc';
import { eDialogEventType, IDialog } from '../../Common/Dialog';
import { ProtocolDefine } from '../../Define/ProtocolDefine';
import { CommonEvent } from '../../Event/CommonEvent';
import { GameEvent } from '../../Event/GameEvent';
import { RoomEvent } from '../../Event/RoomEvent';
import { nRoom } from '../../Model/Room';
import { Utils } from '../../Utils/Utils';
import { eActionStep } from './Action';
const { ccclass, property } = _decorator;

@ccclass('LianQi')
export class LianQi extends Component {
    private _PlayerNum : number = 2;          //玩家人数
    private _BoardLevel : number = 4;         //棋盘阶数

	private _firstHandSeat : number = 0;    //先手玩家

	//public MiroV1.MiroChessBoardPort _Port;

	private _ifOpenHint : boolean = false;// 是否开启棋子信息提示

    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    onEnable(){
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.ACTION_PLAY],
            this.onActionPlay.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.ACTION_PASS],
            this.onActionPass.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.ACTION_MOVE],
            this.onActionMove.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.ACTION_STEP],
            this.onActionStep.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.ACTION_BAN_DIR],
            this.onActionBanDir.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.TO_LQP_SWITCH_HINT],
            this.onSwitchHint.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.TO_LQP_ACTION_FAIL],
            this.onActionFail.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.TO_LQP_CLOCK],
            this.onShowClock.bind(this),this);
    }
    onDisable(){
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.ACTION_PLAY],
            this.onActionPlay.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.ACTION_PASS],
            this.onActionPass.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.ACTION_MOVE],
            this.onActionMove.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.ACTION_STEP],
            this.onActionStep.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.ACTION_BAN_DIR],
            this.onActionBanDir.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.TO_LQP_SWITCH_HINT],
            this.onSwitchHint.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.TO_LQP_ACTION_FAIL],
            this.onActionFail.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.TO_LQP_CLOCK],
            this.onShowClock.bind(this),this);
    }
    //-------------------------- 界面事件-----------------------------
	public onInit(rr : RoomEvent.IUpdateRoomRule) : void{
        this._ifOpenHint = true;//默认开启，该类设置信息，需要后续根据用户习惯，从本地读取配置

		this._PlayerNum = rr.playerNum;
		this._BoardLevel = rr.gridLevel;

		// this._Port.ResetChessBoard (this._BoardLevel);
		// this._Port.SetCampsCount (this._PlayerNum);

		// // 代码里不能修改prefab，否则实际的prefab也会发生变化
		// /*
		// _GridPrefab.transform.localScale =  new Vector3(6.0f/_BoardLevel, 6.0f/_BoardLevel,1.0f);
		// for (int i = 0; i < _ChessPrefab.Length; i++) {
		// 	_ChessPrefab[i].transform.localScale = new Vector3(6.0f/_BoardLevel, 6.0f/_BoardLevel,1.0f);
		// }
		// */
    }
    	// 切换显示棋子信息提示
	public onSwitchHint() : void{
		this._ifOpenHint = !this._ifOpenHint;
    }
    
	public onActionPlay() : void{

		// Hex coord;
		// int dir;
		// int campId;

		// if (!_Port.GetOperatingChessInfo (out coord, out dir, out campId)) {

			this.showDialog("您还没有落子，请落子");
		// 	return;
		// }

        // Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.PLAY],,,);

		// GameEvent.sV2C_Play pdata;

		// pdata.direction = (GameEvent.LIANQI_DIRECTION_TYPE)dir;
		// pdata.x = CommonUtil.Util.Hex2Point(coord).x;
		// pdata.y = CommonUtil.Util.Hex2Point(coord).y;
		// GameEvent.EM().InvokeEvent(GameEvent.EVENT.PLAY,(object)pdata);
    }
    
    public onActionPass() : void{
        Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.PASS]);
    }
    public  onActionMove() : void{
		// GameEvent.sV2C_Move mdata;

		// //请根据实际数据填写
		// mdata.direction = GameEvent.LIANQI_DIRECTION_TYPE.LIANQI_DIRECTION_TYPE_0;
		// mdata.x = 1;
		// mdata.y = 1;
		// GameEvent.EM().InvokeEvent(GameEvent.EVENT.MOVE,(object)mdata);
    }
    public onActionBanDir(ban : boolean,dir : number) : void{
		//_Port.SetBanDir (ban,dir);
    }
    public onActionStep(step : eActionStep) : void{

		if (step == eActionStep.STEP_NOT_TURN) {
			// _Port.DisableChessboardOperation ();
			// //_Port.DisableChessboardOpearionOnEmptyPlacableHex ();
			// //_Port.DisableAllChessOperation();

			// //_Port.TurnDynamics (false);

		} else {
			// //_Port.EnableChessboardOperation ();
			// _Port.EnableChessboardOpearionOnEmptyPlacableHex ();
		}
    }
    public  onLQShowPass(local : number) : void{
		//end turn next
		//_Port.ChooseOperatingCamp ((_Port.GetOperatingCampId()+1)%this._PlayerNum);
    }
    public onShowAbandonPass(local : number) : void{
		this.onLQShowPass(local);
    }
    public onLQShowTurn(st : GameEvent.IShowTurn) : void{
		// 如果是别人pass导致的turn变化，则切换手，否则是第一次发turn，不需要切换
		if (st.isPassTurn) {
			//_Port.ChooseOperatingCamp ((_Port.GetOperatingCampId()+1)%_PlayerNum);
		}
		//超时的换手，则清除试棋的棋子
		if (st.isTimeOut) {
			//如果存在试棋的棋子则删除
			// Hex coord;
			// int dir;
			// int campId;
			// if (_Port.GetOperatingChessInfo (out coord, out dir, out campId)) {

			// 	_Port.CancelOperatingChess (out coord, out dir, out campId);
			// }
		}
    }
    public onLQShowPlay(pm : GameEvent.IPlayOrMove) : void{

		// //这里要判断是否是自己在下棋，如果不是则仅仅刷新
		// //调用下棋接口
		// Hex pos = CommonUtil.Util.Point2Hex(new Vector3i(pm.x,pm.y,0));

		// if (pm.local == nRoom.eSeatType.SELF) {
		// 	Hex coord;
		// 	int dir;
		// 	int campId;

		// 	if (!_Port.ConfirmOperatingChess (out coord, out dir, out campId)) {

		// 		this.showDialog ("操作出错了。。。");

		// 		//原则上不应该出现
		// 		if (!_Port.IsEmptyAt (pos)) {
		// 			//删除已有棋子
		// 			_Port.DisappearAt(pos);
		// 		}

		// 		_Port.TryPlaceChessAt (getPlayerIDByLocal (pm.local), (int)pm.direction, pos);

		// 	}
		// 	//此时关闭
		// 	//_Port.DisableAllChessOperation();
		// } else {
		// 	//原则上不应该出现
		// 	if (!_Port.IsEmptyAt (pos)) {
		// 		//删除已有棋子
		// 		_Port.DisappearAt(pos);
		// 	}
		// 	_Port.TryPlaceChessAt (getPlayerIDByLocal (pm.local), (int)pm.direction, pos);
		// }

		// //更新各个玩家的棋子数
		// this.updatePlayerChessNum ();
    }
    public onLQShowMove(data : any) : void{
		
	}
	public onUpdateFirstHandSeat(seat : number) : void{
		this._firstHandSeat = seat;
    }
    //断线重连
	public onShowLianQi(cb : Array<ProtocolDefine.nGame.nLianQi.Chess>) : void{
		//清空棋盘
		//_Port.ResetChessboard();

		for(var chess in cb){
			//Hex pos = CommonUtil.Util.Point2Hex(new Vector3i(chess.x,chess.y,0));
			//_Port.TryPlaceChessAt(getPlayerIDByLocal (getLocalByPlayID(chess.playerID)), (int)chess.direction, pos);	
		}
    }
    //------------------------------网络事件-----------------------------
	public onActionFail(data : GameEvent.EVENT) : void{
		switch (data) {
		case GameEvent.EVENT.ABANDON:
			break;
		case GameEvent.EVENT.DRAW:
			break;
		case GameEvent.EVENT.PLAY:
			break;
		case GameEvent.EVENT.PASS:
			break;
		case GameEvent.EVENT.MOVE:
			break;
		}
	}

	public onShowClock(data : any) : void{
		
	}

    //-------------------------------------------------------------------------
    public showDialog(content : string){
        let dlg : IDialog = {
            type : eDialogEventType.SIMPLE,
            tip : content,
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
    private updatePlayerChessNum() : void{
		//这里更新下当前各自玩家的棋子数，只有收到落子才更新
        let count : Array<number> = [0,0,0,0];//最多4人，这里全用
		//此处可以自己记录值，也可以通过接口获取
		/*
		foreach (LianQiChess cc in _ChessList) {
			count [cc._PlayerID]++;
		}
		*/

        //更新界面
        Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.TO_GAMEVEIW_UPDATE_SCORE],count);
	}
		
	private getLocalByPlayID(playerId: number) : number{

		return nRoom.RoomData.getLocalBySeat((this._firstHandSeat + this. playerId)%this._PlayerNum);
	}

	private getPlayerIDByLocal(local : number) : number{
		return (this._firstHandSeat + nRoom.RoomData.getSeatByLocal(local))%this._PlayerNum;
	}
}
