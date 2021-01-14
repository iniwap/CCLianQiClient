// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node, Vec2, EventTouch, Label, Sprite, resources, math, Vec3, tween, SpriteFrame } from 'cc';
import { CommonDefine } from '../../Define/CommonDefine';
import { ProtocolDefine } from '../../Define/ProtocolDefine';
import { GameEvent } from '../../Event/GameEvent';
import { nLianQiLogic } from '../../GameLogic/LianQiLogic';
import { nRoom } from '../../Model/Room';
import { Utils } from '../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('GameChess')
export class GameChess extends Component {
    private _chessIdentityNumber : number = -1;//游戏逻辑使用的id
    private _ownner : number = nRoom.eSeatType.INVILID;//棋子势力，即谁落的棋子，这里使用seat即可
    private _chessID : number = -1;
    private _gridID : number = -1;// 占据的grid id
    private _pos : Vec2 = new Vec2(0,0);//棋格坐标
    private _prevPos : Vec2 = new Vec2(0,0);//棋格坐标--用于移动，记录旧的坐标
    private _isTryChess : boolean = false; //是否是尝试落子，已经确定的落子是不能操作的，除非可以移动

    public _health : number = 0;//生命值
    public _attack : number = 0;//攻击力
    public _absorb : number = 0;//防御值
    //方向
    public _direction : ProtocolDefine.nGame.nLianQi.eLianQiDirectionType = ProtocolDefine.nGame.nLianQi.eLianQiDirectionType.LIANQI_DIRECTION_TYPE_NONE;
    public _canMove : boolean = false;// 是否可以移动
    public _hasMove : boolean = false;//是否移动过
    public _isAlive : boolean = false;//是否存活

    @property(Label)
    public healthLabel! : Label;
    @property(Label)
    public attackLabel! : Label;
    @property(Label)
    public absorbLabel! : Label;
    @property(Node)
    public deadTip! : Node;
    @property(Sprite)
    public chessDir! : Sprite;//棋子方向，均和owner对应
    @property(Sprite)
    public chessBg! : Sprite;//棋子背景，代表谁的棋子

    start () {
        // Your initialization goes here.
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStartCallback, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMoveCallback, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEndCallback, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancelCallback, this);

        //this.node.pauseSystemEvents(false);禁用事件
        this.node.resumeSystemEvents(false);//开启事件

        //event.stopPropagation()阻止冒泡
        //this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStartCallback, this, true/*优先响应*/);
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
    public updateChess(x : number,y : number,cid : number,
        dir : ProtocolDefine.nGame.nLianQi.eLianQiDirectionType,
        gid : number,ownner : number) : void{
        this._chessIdentityNumber = -1;
        this._ownner = ownner;
        this._chessID = cid;
        this._gridID = gid;
        this._pos.x = x;
        this._pos.y = y;
        this._prevPos.x = -1;
        this._prevPos.y = -1;
        this._isTryChess = true;
    
        this._health = 0;//生命值
        this._attack = 0;//攻击力
        this._absorb = 0;//防御值
        //方向
        this._canMove = false;// 是否可以移动
        this._hasMove = false;//是否移动过
        this._isAlive = true;//是否存活

        //只有确定落子后才会更换棋子外观，为了区分当前操作棋子
        this.updateDir(dir);

        this.deadTip.setScale(0,0,1);
    }
    public updateDir(dir : ProtocolDefine.nGame.nLianQi.eLianQiDirectionType){
        this._direction = dir;
        if(this._direction != ProtocolDefine.nGame.nLianQi.eLianQiDirectionType.LIANQI_DIRECTION_TYPE_NONE){
            this.chessDir.node.active = true;
            this.chessDir.node.setRotation(new math.Quat(0,0,-60 * this._direction,0));
        }else{
            this.chessDir.node.active = false;//错误的方向就隐藏
        }
    }
    public setChessIdentityNumber(cid : number){
        this._chessIdentityNumber = cid;
    }
    public getChessIdentityNumber() : number{
        return this._chessIdentityNumber;
    }
    public onTouchStartCallback(event : any) : void{
        if(!this._isTryChess && !this._canMove) return;
        
        if(this._isTryChess){
            //落子思考阶段
            let op : GameEvent.IShowOpTips = {
				show : true,
				autoHide : true,
				content : "现在旋转拖动，调整棋子的攻击方向。"
			};
			Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.SHOW_OP_TIPS],op);
        }else if(this._canMove){
            //移动阶段
        }
    }

    //event : Event.EventTouch ?
    public onTouchMoveCallback(event : EventTouch) : void{
        if (this._isTryChess){
            let deg : number = Math.atan2(event.getLocationX() - this.node.position.x, event.getLocationY()- this.node.position.y);

            let i : number = Math.floor(57.2957 * deg);
            i = (i + 480) % 360;
            i = Math.floor(i / 60);
            let dir : ProtocolDefine.nGame.nLianQi.eLianQiDirectionType = i as ProtocolDefine.nGame.nLianQi.eLianQiDirectionType;
            if(dir == this._direction) return;
            Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.CHANGE_CHESS_DIR],dir);
        }
    }

    public onTouchEndCallback(event : any) : void{

    }
    public onTouchCancelCallback(event : any) : void{
        this.onTouchEndCallback(event);
    }

    public updateWhosChess() : void{
        resources.load(CommonDefine.ResPath.CHESS + this._ownner + "/spriteFrame",SpriteFrame,(err,spriteFrame)=>{
            this.chessDir.spriteFrame = spriteFrame!;
        });
        resources.load(CommonDefine.ResPath.CHESS_BG + this._ownner + "/spriteFrame",SpriteFrame,(err,spriteFrame)=>{
            this.chessBg.spriteFrame = spriteFrame!;
        });
    }
    public endPlaceChess(){
        this._isTryChess = false;
        this.setCanMove(false);
    }
    public setCanMove(can : boolean){
        this._canMove = can;
    }
    public getChessID() : number{
        return this._chessID;
    }
    public getChessPos() : Vec2{
        return this._pos;
    }
    public getChessDir() : ProtocolDefine.nGame.nLianQi.eLianQiDirectionType{
        return this._direction;
    }
    public getOwner() : number{
        return this._ownner;
    }
    public getGridID() : number{
        return this._gridID;
    }
    public getHealth() : number{
        return this._health;
    }
    public setCantPlace() : void{
        this.healthLabel.string = "";
        this.attackLabel.string = "";
        this.absorbLabel.string = "";
        this._health = -1;
        this._attack = -1;
        this._absorb = -1;

        //隐藏死亡标致
        tween(this.deadTip)
        .to(0.25, { scale: new Vec3(0, 0, 1) })
        .start();
    }
    private doLabelScaleAni(n : Node,show : boolean = true) : void{
        n.active = true;
        if(show){
            n.scale = new Vec3(0,0,1);
            tween(n)
            .to(0.5, { scale: new Vec3(1, 1, 1) })
            .start();
        }else{
            tween(n)
            .to(0.5, { scale: new Vec3(0, 0, 1) })
            .start();
        }
    }
    private doDeadAni(dead : boolean) : void{
        if(dead){
            tween(this.deadTip)
            .to(0.25, { scale: new Vec3(1, 1, 1) })
            .start();
        }else{
            tween(this.deadTip)
            .to(0.25, { scale: new Vec3(0, 0, 1) })
            .start();
        }
    }
    public updateChessUI(lc : nLianQiLogic.Chess) {
        if (this._health != lc.health) {
            this.doLabelScaleAni(this.healthLabel.node);
            this.healthLabel.string = "" + lc.health;
            this._health = lc.health;
        }
        if (this._health <= 0){
            //该棋子死掉
            this.doDeadAni(true);
        }else{
            this.doDeadAni(false);
        }
        if (this._attack != lc.attack){
            this.doLabelScaleAni(this.attackLabel.node);
            this.attackLabel.string = "" + lc.attack;
            this._attack = lc.attack;
        }

        if (this._absorb != lc.absorb) {
            if (lc.absorb == 0){
                this.doLabelScaleAni(this.absorbLabel.node,false);
                this._absorb = 0;
                this.absorbLabel.string = "" + this._absorb;
            }else{
                this.doLabelScaleAni(this.absorbLabel.node);
                this._absorb = lc.absorb;
                this.absorbLabel.string = "" + this._absorb;
            }
        }
    }
}
