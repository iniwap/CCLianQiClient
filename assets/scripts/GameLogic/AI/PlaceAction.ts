import { ProtocolDefine } from "../../Define/ProtocolDefine";
import { nLianQiLogic } from "../LianQiLogic";
import { nRule } from "../Rule";

 export enum ePlaceType{
    NONE,
    ADD,
    MOVE,
 };

export class PlaceAction {
    public type : ePlaceType = ePlaceType.NONE;
    public x : number = -1;
    public y : number = -1;
    public direction : ProtocolDefine.nGame.nLianQi.eLianQiDirectionType = ProtocolDefine.nGame.nLianQi.eLianQiDirectionType.LIANQI_DIRECTION_TYPE_NONE;
    public ownner : number = -1;

    public constructor(){
        this.type =  ePlaceType.NONE;
        this.x = -1;
        this.y = -1;
        this.direction = -1;
        this.ownner = -1;
    }

    public init(pt : ePlaceType,xx : number,yy : number,
        dir : ProtocolDefine.nGame.nLianQi.eLianQiDirectionType,ow : number) : void{
        this.type = pt;
        this.x = xx;
        this.y = yy;
        this.direction = dir;
        this.ownner = ow;
    }

    public isValid(lcb : nLianQiLogic.ChessBoard) : nLianQiLogic.ChessBoard | null {
        let idm : number = lcb.addNewChessUnSafe(this.x, this.y, this.direction, this.ownner);
        nRule.GameBoardCalculateItself(lcb);

        let lc : nLianQiLogic.Chess | null= lcb.findChessByIdnum(idm);
        if(lc == null){
            //出错了
            //找到了空棋子，ai下子有问题
            return null;//结束游戏，ai输
        }

        if (lc.health <= 0){
            return null;//无法下棋了，判定为结束了，ai输
        }else{
            return lcb;
        }
    }
}
