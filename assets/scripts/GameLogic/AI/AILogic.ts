//AI逻辑，用于单机模式或机器人

import { GameEvent } from "../../Event/GameEvent";
import { nRoom } from "../../Model/Room";
import { Utils } from "../../Utils/Utils";
import { nLianQiLogic } from "../LianQiLogic";
import { ePlaceType } from "./PlaceAction";
import { PlaceMethod } from "./PlaceMethod";
import { PlaceMethodGenerator } from "./PlaceMethodGenerator";
import { TreeSelector } from "./TreeSelector";

export class AILogic{
    public static _instance : AILogic;
    private _hasEnded : boolean = false;
    private _pm : PlaceMethod | null = null;
    private _gridLevel : number = 0;
    private _seat : number = nRoom.eSeatType.INVILID;

    public static getInstance() : AILogic{
        if(this._instance == null){
            this._instance = new AILogic();
        }
        return this._instance;
    }
    public init(seat : number,gridLevel : number) : void{
        this._gridLevel = gridLevel;
        this._seat = seat;
    }
    public getAISeat() : number{
        return this._seat;
    }
    private doPlace() : boolean {
        if (this._pm == null) return false;
        for(let pa of this._pm.getActions()) {
            switch (pa.type){
                case ePlaceType.NONE:
                    break;
                case ePlaceType.ADD:
                    let chess : GameEvent.IPlay = {x : pa.x,y : pa.y,direction : pa.direction};
                    Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.AI_PLAY],chess,pa.ownner);
                    break;
                case ePlaceType.MOVE:
                    //暂不支持移动
                    break;
                default:
                    break;
            }
        }
        return true;
    }
    //lcb = nGame.Game.chessBoard -- 此处需要传递的是原始棋盘数据
    public AIThink(lcb : nLianQiLogic.ChessBoard) {
        this._pm = null;
        this._hasEnded = false;
        //机器人开始思考
        //选择评估算法
        this.getValueMultiLayerPurge(lcb,2,0.9);
        if (this._hasEnded){
            if(this.doPlace()){
                return;
            }
            //实现了优质算法
        }
        else {
            //最简算法
        }

        //没有成功，ai投降，结束游戏 TODO
        
    }

    private randomChoose(lcb : nLianQiLogic.ChessBoard) : void {
        this._pm = PlaceMethodGenerator.getRandomPlaceMethod(this._seat,this._gridLevel,lcb);
        this._hasEnded = true;
    }

    private getMinValueOnce(lcb : nLianQiLogic.ChessBoard) : void{
        this._pm = TreeSelector.getMinPlaceMethod_OL(this._seat,this._gridLevel,lcb);
        this._hasEnded = true;
    }

    private getValueMultiLayer(lcb : nLianQiLogic.ChessBoard,layer : number) : void{ 
        this._pm = TreeSelector.getBestMethodMultiLayer(this._seat,this._gridLevel,lcb,layer);
        this._hasEnded = true;
    }

    private getValueMultiLayerPurge(lcb : nLianQiLogic.ChessBoard,layer : number,purgeRate : number) : void{
        this._pm = TreeSelector.getBestMethodMultiLayerPurge(this._seat,this._gridLevel,lcb,layer, purgeRate);
        this._hasEnded = true;
    }

}