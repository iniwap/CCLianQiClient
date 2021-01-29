import { nLianQiLogic } from "../LianQiLogic";
import { ePlaceType, PlaceAction } from "./PlaceAction";

export class PlaceMethod {
    private _actions : Array<PlaceAction> = [];
    public addAction(pt : ePlaceType,xx : number,yy : number,dir : number,ownner : number) : PlaceMethod {
        let pa : PlaceAction = new PlaceAction();
        pa.init(pt, xx, yy, dir, ownner);
        this._actions.push(pa);
        return this;
    }

    public setNone() : PlaceMethod{
        this._actions = [];
        this._actions.push(new PlaceAction());
        return this;
    }

    public isValid(lcb : nLianQiLogic.ChessBoard) : boolean{
        if (this._actions.length == 1 && this._actions[0].type == ePlaceType.NONE) {
            return true;
        }

        let lcb2 : nLianQiLogic.ChessBoard | null = lcb.getCopy();
        for(let pi of this._actions){
            lcb2 = pi.isValid(lcb2);
            if (lcb2 == null) {
                return false;
            }
        }
        return true;
    }
    public getActions() : Array<PlaceAction>{
        return this._actions;
    }
}
