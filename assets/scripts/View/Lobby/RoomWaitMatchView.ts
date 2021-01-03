//
//等待游戏匹配界面
//

import { _decorator, Node, Sprite, Label, Prefab, resources, SpriteFrame, instantiate} from 'cc';
import { CommonDefine } from '../../Define/CommonDefine';
import { ProtocolDefine } from '../../Define/ProtocolDefine';
import { GameEvent } from '../../Event/GameEvent';
import { RoomEvent } from '../../Event/RoomEvent';
import { nRoom } from '../../Model/Room';
import { NetwokState } from '../../Utils/NetwokState';
import { Utils } from '../../Utils/Utils';
import { RoomPlayer } from './PlazaRoom/RoomPlayer';
const { ccclass, property } = _decorator;

@ccclass('RoomWaitMatchView')
export class RoomWaitMatchView extends NetwokState {
    private _inRoomGridLevel : number = 0;
    private _inRoomPlayerNum : number = 0;
    
    @property(Sprite)
    public plazaTagImg !: Sprite;
    @property(Label)
    public plazaName! : Label ;
    @property(Sprite)
    public plazaStar : Array<Sprite> = [];
    @property(Label)
    public modeText !: Label;
    @property(Label)
	public ruleText !: Label;
    @property(Prefab)
	public roomPlayerPrefab! : Prefab ;

    @property(Node)
	public roomPlayer : Array<Node> = [];
    private _realPlayer : Array<RoomPlayer | null> = [null,null,null,null];
    
    @property(Label)
    public waitClock !: Label;
    private _currentTime : number = 0;
    
    private _roomRule!: RoomEvent.IUpdateRoomRule;

    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    onEnable(){
		super.onEnable();
        Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_ROOMRULE],
			this.OnUpdateRoomRule.bind(this),this);
		Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_LEAVE_ROOM],
			this.OnUpdatePlayerLeave.bind(this),this);
		Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.PLAER_ENTER],
			this.OnUpdatePlayerEnter.bind(this),this);
		Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_PLAER_STATE],
            this.OnUpdatePlayerState.bind(this),this);

        for (var i = 0; i < 4; i++) {
			if(this._realPlayer[i] != null){
				this._realPlayer[i]?.node.destroy();
			}
			this._realPlayer[i] = null;
			this.showWaitImg(false,i);
        }

        Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.ENTER_ROOM_FINISH]);
    }
    onDisable(){
		super.onDisable();
        Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_ROOMRULE],
			this.OnUpdateRoomRule.bind(this),this);
		Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_LEAVE_ROOM],
			this.OnUpdatePlayerLeave.bind(this),this);
		Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.PLAER_ENTER],
			this.OnUpdatePlayerEnter.bind(this),this);
		Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_PLAER_STATE],
            this.OnUpdatePlayerState.bind(this),this);
    }
    
    public OnClickBack(){
		//离开房间
        Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.LEAVE_ROOM],false);
        this.unschedule(this.updateClock);
    }
    public OnPlayerClickReadyBtn() : void{        
        Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.PLAYER_ACT],
            ProtocolDefine.nRoom.eActType.ACT_READY);
    }
    
    public OnUpdateRoomRule(roomRule : RoomEvent.IUpdateRoomRule) : void{

        this._roomRule = roomRule;
		this._inRoomGridLevel = roomRule.gridLevel;
		this._inRoomPlayerNum = roomRule.playerNum;

		this.modeText.string = Utils.getModeStr(roomRule.type,roomRule.playerNum,roomRule.gridLevel);

		if (roomRule.type == ProtocolDefine.nRoom.eCreateRoomType.ROOM_PLAZA) {

			let rr : string = "";
			if (roomRule.lmtRound != 0) {
				rr = "回合限制" + roomRule.lmtRound;
			} else {
				rr = "回合无限制";
			}

			if (roomRule.lmtTurnTime != 0) {
				rr = rr + " 思考时间" + roomRule.lmtTurnTime + "秒";
			} else {
				rr = rr + " 思考时间无限制";
			}

			this.ruleText.string = rr;
			this.ruleText.node.active = true;

			this.plazaName.node.active = true;
			this.plazaName.string = roomRule.plazaName;
            this.plazaTagImg.node.active = true;
            
			resources.load(CommonDefine.ResPath.PLAZA_TAG + roomRule.tag + "/spriteFrame",
				SpriteFrame, (err, spriteFrame) => {
                this.plazaTagImg.spriteFrame = spriteFrame!;
                //spriteFrame.addRef();
            });

			for (var i = 0; i < this.plazaStar.length; i++) {
				this.plazaStar[i].node.active = false;
				if (i < Math.floor(roomRule.star)) {
					this.plazaStar[i].node.active = true;
				}
			}
			if (Math.floor(roomRule.star) + 0.5 == roomRule.star) {
                this.plazaStar[Math.floor(roomRule.star)].node.active = true;
				resources.load(CommonDefine.ResPath.PLAZA_HALF_STAR + "/spriteFrame",
					SpriteFrame, (err, spriteFrame) => {
                    this.plazaStar[Math.floor(roomRule.star)].spriteFrame = spriteFrame!;
                    //spriteFrame.addRef();
                });    
			}
		}else if(roomRule.type == ProtocolDefine.nRoom.eCreateRoomType.ROOM_CLASSIC_PLAZA){
			//经典模式，不显示任何多余信息
			this.ruleText.node.active = false;
			this.plazaName.node.active = false;
			this.plazaTagImg.node.active = false;

			for (var i = 0; i < this.plazaStar.length; i++) {
				this.plazaStar[i].node.active = false;
			}
		}
    }
    public OnUpdatePlayerEnter(player : nRoom.Player) : void{
        //更新等待界面
		if (this._roomRule.type != ProtocolDefine.nRoom.eCreateRoomType.ROOM_PLAZA
            && this._roomRule.type != ProtocolDefine.nRoom.eCreateRoomType.ROOM_CLASSIC_PLAZA) {
                return;
        }

        //进来之后自动准备 - 自动准备，没有准备按钮
		if (player.state == ProtocolDefine.nRoom.eStateType.STATE_TYPE_SITDOWN) {
			this.OnPlayerClickReadyBtn ();
		}
        
		let local : number = nRoom.RoomData.getLocalBySeat(player.seat) ;

		//ADD PLAYER
		this._realPlayer[local] = this.createPlayer(player);

		this.showWaitImg (false,local);

		if (local == nRoom.eSeatType.SELF) {

			if (this._inRoomPlayerNum == 2) {
				this.showWaitImg (true,nRoom.eSeatType.TOP);
			} else if (this._inRoomPlayerNum == 3) {
				this.showWaitImg (true, nRoom.eSeatType.RIGHT);
				this.showWaitImg (true, nRoom.eSeatType.LEFT);
			} else if (this._inRoomPlayerNum == 4) {
				this.showWaitImg (true, nRoom.eSeatType.RIGHT);
				this.showWaitImg (true, nRoom.eSeatType.LEFT);
				this.showWaitImg (true, nRoom.eSeatType.TOP);
			}

			this._currentTime = 0;
			//开启等待计时
            this.schedule(this.updateClock, 1);
		}
    }
    public OnUpdatePlayerState(ps : RoomEvent.IUpdatePlayerState) : void{
		if (this._roomRule.type != ProtocolDefine.nRoom.eCreateRoomType.ROOM_PLAZA
            && this._roomRule.type != ProtocolDefine.nRoom.eCreateRoomType.ROOM_CLASSIC_PLAZA) {
                return;
        }
        
		//场模式，进来自动准备，一般不需要更新用户状态
		if (ps.state == ProtocolDefine.nRoom.eStateType.STATE_TYPE_ROOMREADY &&
		    ps.local == nRoom.eSeatType.SELF) {
		} else {
			//修改别人的状态为准备
		}
	}
	public OnUpdatePlayerLeave(local : number){
        if (this._roomRule.type != ProtocolDefine.nRoom.eCreateRoomType.ROOM_PLAZA
            && this._roomRule.type != ProtocolDefine.nRoom.eCreateRoomType.ROOM_CLASSIC_PLAZA) {
                return;
        }

		this.showWaitImg(true,local);
		//REMOVE PLAERY
        this._realPlayer[local]?.node.destroy();
        this._realPlayer[local] = null;
    }

	public updateClock() : void{
		this._currentTime++;
		this.waitClock.string = ""+this._currentTime + "s";
	}

    public OnHidePanel(hide : boolean){
        this.unschedule(this.updateClock);
		this.node.active = !hide;

		// 对局开始
		if (this._roomRule.type != ProtocolDefine.nRoom.eCreateRoomType.ROOM_PLAZA
			&& this._roomRule.type != ProtocolDefine.nRoom.eCreateRoomType.ROOM_CLASSIC_PLAZA) {
			return;
		}
		// 是否有必要释放？
		for (var i = 0; i < 4; i++) {
			if(this._realPlayer[i] != null){
				this._realPlayer[i]?.node.destroy();
			}
			this._realPlayer[i] = null;
		}
    }

    public showWaitImg(show : boolean,local : number){
		this.roomPlayer[local].getChildByName("WaitImg")!.active = show;
    }
    
    public createPlayer(data : nRoom.Player ) : RoomPlayer{

		let local : number = nRoom.RoomData.getLocalBySeat(data.seat);

		let n : Node = instantiate(this.roomPlayerPrefab);
		let player : RoomPlayer = n.getComponent(RoomPlayer)!;

		player.node.setParent(this.roomPlayer[local]);

		let total : number = data.win + data.lose + data.draw;
		let winRate : number = 0.0;
		if (total != 0) {
			winRate = 100 * 1.0 * data.win / (data.win + data.lose + data.draw);
		}
		player.updateRoomPlayer(nRoom.eRoomPlayerType.ROOM_WIAT,
			local,data.vip,winRate,data.head,data.isOwner,data.name);

		player.node.setPosition(0,0);

		//player.node.setScale(player.node.scale * Utils.getScreenScale());

		return player;
	}
}
