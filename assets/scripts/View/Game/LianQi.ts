// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node, instantiate, Prefab, tween, Vec3, Vec2, UITransform, Size, Game } from 'cc';
import { eDialogEventType, IDialog } from '../../Common/Dialog';
import { ProtocolDefine } from '../../Define/ProtocolDefine';
import { CommonEvent } from '../../Event/CommonEvent';
import { GameEvent } from '../../Event/GameEvent';
import { RoomEvent } from '../../Event/RoomEvent';
import { nLianQiLogic } from '../../GameLogic/LianQiLogic';
import { nGame } from '../../Model/Game';
import { nRoom } from '../../Model/Room';
import { Utils } from '../../Utils/Utils';
import { eActionStep } from './Action';
import { GameChess } from './GameChess';
import { GameGrid } from './GameGrid';
const { ccclass, property } = _decorator;

@ccclass('LianQi')
export class LianQi extends Component {
	private _ifOpenHint : boolean = false;// 是否开启棋子信息提示

	@property(Node)
	public gridRoot! : Node;
	@property(Node)
	public chessRoot!: Node;
	@property(Prefab)
	public gridPrefab!: Prefab;
	@property(Prefab)
	public chessPrefab! : Prefab;
	private _gridList : Array<GameGrid> = [];//棋格
	private _chessList : Array<GameChess> = [];       //棋子

	private _tryPlaceChess : GameChess | null = null;
	
    start () {
		// Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    onEnable(){
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.TO_LQP_SWITCH_HINT],
            this.onSwitchHint.bind(this),this);
        Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.TO_LQP_CLOCK],
			this.onShowClock.bind(this),this);
		Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.SHOW_LIANQI],
			this.onShowLianQi.bind(this),this);
		
		//界面消息
		Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.PLACE_CHESS],
			this.onEventPlaceChess.bind(this),this);
		Utils.getGlobalController()?.On(GameEvent.EVENT[GameEvent.EVENT.CHANGE_CHESS_DIR],
			this.onEventChangeChessDir.bind(this),this);
    }
    onDisable(){
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.TO_LQP_SWITCH_HINT],
            this.onSwitchHint.bind(this),this);
        Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.TO_LQP_CLOCK],
			this.onShowClock.bind(this),this);
		
		Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.SHOW_LIANQI],
			this.onShowLianQi.bind(this),this);
		//界面消息
		Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.PLACE_CHESS],
			this.onEventPlaceChess.bind(this),this);
		Utils.getGlobalController()?.Off(GameEvent.EVENT[GameEvent.EVENT.CHANGE_CHESS_DIR],
			this.onEventChangeChessDir.bind(this),this);
			
		//清空
		this.clearGridList();
		this.clearChessList();
	}
    //-------------------------- 界面事件-----------------------------
	public onInit(rr : RoomEvent.IUpdateRoomRule) : void{
        this._ifOpenHint = true;//默认开启，该类设置信息，需要后续根据用户习惯，从本地读取配置
		//生成棋盘，并执行动画 
		this.generateGridBoard(rr.gridLevel);
		nGame.GameData.startGame(rr.playerNum,rr.gridLevel);
    }
	// 切换显示棋子信息提示
	public onSwitchHint() : void{
		this._ifOpenHint = !this._ifOpenHint;
    }
    
	public onActionPlay() : boolean{
		let can = this.canPlay();
		if(!can) return false;

		let play : GameEvent.IPlay = {
			x : this._tryPlaceChess!.getChessPos().x,
			y : this._tryPlaceChess!.getChessPos().y,
			direction : this._tryPlaceChess!.getChessDir()
		};
        Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.PLAY],play);

		return true;
    }
    
    public onActionPass() : boolean{
		let can = this.canPass();
		if(!can) return false;
		Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.PASS]);
		return true;
    }
    public  onActionMove() : boolean{
		let can = this.canMove();
		if(!can) return false;
		//移动到当前操作棋子到攻击方向下一格，该格需要被吃掉
		let move : GameEvent.IMove = {
			x : this._tryPlaceChess!.getChessPos().x,
			y : this._tryPlaceChess!.getChessPos().y,
			direction : this._tryPlaceChess!.getChessDir()
		};
		//Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.MOVE],move);
		
		return true;
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
	//自己点结束回合的响应
    public  onLQShowPass(local : number) : void{
		//肯定不会轮到自己
		//如果存在试棋的棋子则删除
		this.endTurn();
		if(this._tryPlaceChess != null){
			if(this._tryPlaceChess.getGridID() != -1){//不应该出现
				this._gridList[this._tryPlaceChess.getGridID()].enableGrid(true);
			}
			this._tryPlaceChess.node.destroy();
			this._tryPlaceChess = null;
		}
    }
    public onShowAbandonPass(local : number) : void{
		this.onLQShowPass(local);
		
    }
    public onLQShowTurn(st : GameEvent.IShowTurn) : void {
		this.showTurnTip();
		// 如果是别人pass导致的turn变化，则切换手，否则是第一次发turn，不需要切换
		if (st.isPassTurn) {
			this.endTurn();
		}else{
			//游戏开始的turn，无需change
		}
		//超时的换手，原则上只有自己的时候才有试棋的棋子
		if (st.isTimeOut) {
			//如果存在试棋的棋子则删除
			if(this._tryPlaceChess != null){
				if(this._tryPlaceChess.getGridID() != -1){//不应该出现
					this._gridList[this._tryPlaceChess.getGridID()].enableGrid(true);
				}
				this._tryPlaceChess.node.destroy();
				this._tryPlaceChess = null;
			}
		}
    }
    public onLQShowPlay(pm : GameEvent.IPlayOrMove){
		//销毁试用的棋子，如果有的话，其实只有当自己下的时候才有
		if(this._tryPlaceChess != null){
			this._tryPlaceChess.node.destroy();
			this._tryPlaceChess = null;
		}
		//别人落子，刷新棋盘
		let chess : GameChess | null = this.tryPlaceChess(false,pm.x,pm.y,pm.direction,nRoom.RoomData.getSeatByLocal(pm.local));
		if(chess != null){
			if(chess.getHealth() <= 0){
				chess.node.destroy();
			}else{
				this.placeChess(chess);
			}
		}else{
			Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_OP_TIPS],
				{show : true,autoHide : false,content : "此处无法落子，出错了。"});
		}
		
		this.updatePlayerChessNum();
    }
    public onLQShowMove(data : any) : void{
		
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
	
	public onEventPlaceChess(pos : Vec2,gid : number) : void{
		//判断是否是自己的回合，不是则提示，拒绝落子
		if(!this.checkSelfTurn()){
			let op : GameEvent.IShowOpTips = {
				show : true,
				autoHide : true,
				content : "当前不是你的回合，无法落子，请等待对方落子。"
			};
			Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_OP_TIPS],op);
			return;
		}

		let prevGridID = -1;
		if(this._tryPlaceChess != null){
			prevGridID = this._tryPlaceChess.getGridID();
			this._tryPlaceChess.node.destroy();
			this._tryPlaceChess = null;
			if(prevGridID != -1 && prevGridID != gid){
				this._gridList[prevGridID].enableGrid(true);//原来的棋格可以点击了
			}
		}
		//需要查找一个可用的方向
		//try chess id 为落到的棋格id，不需要去查找，确定落子的时候赋值为实际id
		let banDirs : Array<ProtocolDefine.nGame.nLianQi.eLianQiDirectionType> = nGame.GameData.getUsableDirection();
		this._tryPlaceChess = this.tryPlaceChess(true,pos.x,pos.y,banDirs[0],nRoom.RoomData.selfSeat);
	}
	public onEventChangeChessDir(dir : ProtocolDefine.nGame.nLianQi.eLianQiDirectionType) : void{
		if(!this.checkSelfTurn()){
			let op : GameEvent.IShowOpTips = {
				show : true,
				autoHide : true,
				content : "当前不是你的回合，无法调整棋子方向。"
			};
			Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_OP_TIPS],op);
			return;
		}
		if(this._tryPlaceChess == null){
			Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_OP_TIPS],
				{show : true,autoHide : true,content : "请先点击空白棋格落子，再调整攻击方向。"});
			return;
		}
		this.changeChessDir(this._tryPlaceChess,dir);
	}
    //------------------------------网络事件-----------------------------
	public onActionFail(data : GameEvent.EVENT) : void{
		switch (data) {
		case GameEvent.EVENT.ABANDON:
			break;
		case GameEvent.EVENT.DRAW:
			break;
		case GameEvent.EVENT.PLAY:
			//需要回撤之前下的棋子
			break;
		case GameEvent.EVENT.PASS:
			break;
		case GameEvent.EVENT.MOVE:
			break;
		}
	}

	public onShowClock(data : any) : void{
		
	}
	//-------------------界面封装---------------
	private clearChessList() : void{
		for(var i = 0;i < this._chessList.length;i++){
			if(this._chessList[i] != null){
				this._chessList[i].node.destroy();
			}
		}
		this._chessList = [];
	}
	private clearGridList() : void{
		for(var i = 0;i < this._gridList.length;i++){
			if(this._gridList[i] != null){
				this._gridList[i].node.destroy();
			}
		}
		this._gridList = [];
	}
	private generateGridBoard(level : number) :void{
		this.clearChessList();
		this.clearGridList();
        for (var i = 0; i < 2 * level - 1; i++){
            if (i < level){
                for (var j = 0; j < level + i; j++){
                    this._gridList.push(this.createGird(i - level + 1, j - level + 1,this._gridList.length));
                }
            }else{
                for (var j = i - level + 1; j < 2 * level - 1; j++){
					this._gridList.push(this.createGird(i - level + 1, j - level + 1,this._gridList.length));
                }
            }
		}
		this.doGridBordAni();
	}
	private doGridBordAni(){
		for(let grid of this._gridList){
			tween(grid.node)
			.to(2, { position : this.getPosByGridLevel(grid.getGridPos().x,grid.getGridPos().y,nGame.GameData.boardLevel)}, 
				{ easing: 'bounceOut',onComplete: (target?: object) => {
					grid.enableGrid(true);
				}})
			.start();
		}
	}
	//-------------------------------------------------------------------------
	public createGird(x : number,y : number,gid : number) : GameGrid{
		let n : Node = instantiate(this.gridPrefab);
		let grid : GameGrid = n.getComponent(GameGrid)!;
		grid.node.setParent(this.gridRoot);
		grid.updateGameGrid(x,y,gid);
		grid.node.setPosition(0,0);
		n.setScale(this.getScaleByGridLevel(nGame.GameData.boardLevel));
		return grid;
	}
	public createChess(x : number,y : number,cid : number,
        dir : ProtocolDefine.nGame.nLianQi.eLianQiDirectionType,
        gid : number,ownner : number) : GameChess{

		let n : Node = instantiate(this.chessPrefab);
		let chess : GameChess = n.getComponent(GameChess)!;
		chess.node.setParent(this.chessRoot);
		chess.updateChess(x,y,cid,dir,gid,ownner);
		n.setScale(this.getScaleByGridLevel(nGame.GameData.boardLevel));
		chess.node.setPosition(this.getPosByGridLevel(x,y,nGame.GameData.boardLevel));// 此处需要放置到实际位置
		return chess;
	}
	public updateBoard(chesses : Array<nLianQiLogic.Chess>,chess : GameChess | null = null) : void{
		if (chess != null){
			for(let lc of chesses){
				if (lc.isPosEqual(chess.getChessPos().x, chess.getChessPos().y)) {
					chess.setChessIdentityNumber(lc.identityNumber);
					chess.updateChessUI(lc);
					break;
				}
			}
		}

        for(let co of this._chessList) {
            for(let lc of chesses) {
                if (co.getChessIdentityNumber() == lc.identityNumber) {
                    co.updateChessUI(lc);
                }
            }
        }
        //扩增棋子（比如AI等，会不经过addChess这样的方法去调用底层数据）
		//因此会出现这样被动新增棋子的局面
		// todo
	}
	public placeChess(chess : GameChess) : void{
		//落子成功，原则上一定是成功的，需要以服务端为准
		//如果可以下棋，则下棋一个
		this._chessList.push(chess);
		nGame.GameData.placeChess(chess.getChessPos().x,chess.getChessPos().y,chess.getChessDir());
		if (nGame.GameData.chessBoard!.deads.length > 0){
			//可以移动 -- 对于自己来说，别人进入移动阶段
			Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_OP_TIPS],
				{show : true,autoHide : false,content : "对方进入可移动棋子阶段，请等待对方回合结束。"});
			chess.setCanMove(true);
		}else{
			//不能移动棋子，等待对方结束回合
			Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_OP_TIPS],
				{show : true,autoHide : false,content : "对方已落子，请等待对方回合结束。"});
			chess.endPlaceChess();
		}

		chess.updateWhosChess();
	}
	public tryPlaceChess(isTry : boolean,x : number,y : number,dir : ProtocolDefine.nGame.nLianQi.eLianQiDirectionType,
		owner : number) : GameChess | null{
		let gid = this.getGridIDByPos(x,y);
		let chess : GameChess | null = this.createChess(x,y,-1,
			ProtocolDefine.nGame.nLianQi.eLianQiDirectionType.LIANQI_DIRECTION_TYPE_NONE,gid,owner);
		chess.updateIsTryChess(isTry);
		if(this.changeChessDir(chess,dir)){
			this._gridList[gid].enableGrid(false);//禁用棋格
		}else{
			chess.node.destroy();
			chess = null;
		}
		return chess;
	}
	public changeChessDir(chess : GameChess,dir : ProtocolDefine.nGame.nLianQi.eLianQiDirectionType) : boolean{
		chess.updateDir(dir);
		let banDirs: Array<ProtocolDefine.nGame.nLianQi.eLianQiDirectionType> = nGame.GameData.getUsableDirection();
		//如果这个方向不禁手
		if (banDirs.indexOf(dir) != -1) {
			let lcb : nLianQiLogic.ChessBoard | null = nGame.GameData.tryToPlace(chess.getChessPos().x, 
				chess.getChessPos().y, chess.getChessDir());
			if (lcb == null){
				return false;
			}
			//更新棋子显示
			this.updateBoard(lcb.chesses,chess);
			let lc : nLianQiLogic.Chess | null= lcb.findChessByPosition(chess.getChessPos().x,chess.getChessPos().y);
			if (lc == null) {
				return false;
			}

			if (lc.health <= 0){
				let op : GameEvent.IShowOpTips = {
					show : true,
					autoHide : false,
					content : "此处会导致棋子被杀死，不能落子。"
				};
				Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_OP_TIPS],op);
			}
			else{
				let op : GameEvent.IShowOpTips = {
					show : false,
					autoHide : false,
					content : ""
				};
				Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_OP_TIPS],op);
			}
		}else {
			Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_OP_TIPS],
				{show : false,autoHide : false,content : ""});
			chess.setCantPlace();
			this.updateBoard(nGame.GameData.chessBoard!.chesses,chess);
		}

		return true;
	}
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
	private showTurnTip() : void{
		if(this.checkSelfTurn()){
			Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_OP_TIPS],
				{show : true,autoHide : true,content : "当前轮到你下棋，请点击棋盘空白处落子。"});
		}else{
			Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_OP_TIPS],
				{show : true,autoHide : true,content : "当前轮到别人下棋，请等待别人落子。"});
		}
	}
    private updatePlayerChessNum() : void{
		//这里更新下当前各自玩家的棋子数，只有收到落子才更新
        let count : Array<number> = [0,0,0,0];//最多4人，这里全用
		//此处可以自己记录值，也可以通过接口获取
		for(let lc of this._chessList) {
			if(lc.getOwner() != nRoom.eSeatType.INVILID){
				count[lc.getOwner()]++;
			}
		}

        //更新界面
        Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.TO_GAMEVEIW_UPDATE_SCORE],count);
	}
		
	private getLocalByPlayID(playerId: number) : number{

		return nRoom.RoomData.getLocalBySeat((nGame.GameData.firstHandSeat + playerId)%nGame.GameData.playerNum);
	}

	private getPlayerIDByLocal(local : number) : number{
		return (nGame.GameData.firstHandSeat + nRoom.RoomData.getSeatByLocal(local))%nGame.GameData.playerNum;
	}
	private getPosByGridLevel(x : number,y : number,gridLevel : number) : Vec3{
		let pos : Vec3 = new Vec3(0,0,0); 

		//140 是棋格、棋子prefab的高度
		pos.x = 140 * 7 / (2 * gridLevel - 1) * (x - y / 2);
		pos.y = 140 * 7 / (2 * gridLevel - 1) * (y * Math.sqrt(3) / 2);

		return pos;
	}
	private getScaleByGridLevel(gridLevel : number) : Vec3{
		let s =  7 / (2 * gridLevel - 1);
		return new Vec3(s,s,1);
	}
	private checkSelfTurn() : boolean{
		return nGame.GameData.currentTurn == nRoom.RoomData.selfSeat;
	}
	private getGridIDByPos(x : number,y : number){
		for(let grid of this._gridList){
			if(grid.getGridPos().x == x && grid.getGridPos().y == y){
				return grid.getGridID();
			}
		}
		return -1;
	}
	private canPlay() : boolean{
		if(!this.checkSelfTurn()){
			Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_OP_TIPS],
				{show : true,autoHide : true,content : "当前不是你的回合，无法执行操作。"});
			return false;
		}
		if(this._tryPlaceChess == null){
			Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_OP_TIPS],
				{show : true,autoHide : true,content : "请先点击棋盘空白格落子，再确定落子。"});
			return false;
		}
		if(this._tryPlaceChess.getHealth() <= 0){
			Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_OP_TIPS],
				{show : true,autoHide : true,content : "此处落子棋子直接阵亡，请换其他地方落子。"});
			return false;
		}
		return true;
	}
	private canPass() : boolean{
		if(!this.checkSelfTurn()){
			Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_OP_TIPS],
				{show : true,autoHide : true,content : "当前不是你的回合，无法执行操作。"});
			return false;
		}
		return true;
	}
	private canMove() : boolean{
		if(!this.checkSelfTurn()){
			Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_OP_TIPS],
				{show : true,autoHide : true,content : "当前不是你的回合，无法执行操作。"});
			return false;
		}
		
		if (nGame.GameData.chessBoard!.deads.length > 0){
			return true;
		}
		return false;
	}
	private endTurn(){
		nGame.GameData.changeTurn();
		//删除所有死掉的棋子
		let dco : Array<GameChess> = [];
		for(let co of this._chessList) {
			if (co.getHealth() <= 0) {
				dco.push(co);
			}
		}

		for(let co of dco) {
			this._chessList.splice(this._chessList.indexOf(co),1);
			co.node.destroy();
		}
	}
}
