import { ProtocolDefine } from "../../Define/ProtocolDefine";
import { nLianQiLogic } from "../LianQiLogic";
import { nRule } from "../Rule";
import { GameBoardEvaluator } from "./GameBoardEvaluator";
import { ePlaceType } from "./PlaceAction";
import { PlaceMethod } from "./PlaceMethod";

export class PlaceMethodGenerator {
    public static getPlacedChessBoard(pm : PlaceMethod,lcb : nLianQiLogic.ChessBoard) : nLianQiLogic.ChessBoard {
        if (pm == null){
           //出错了，没有准备好，应该避免传入null
           return lcb;
        }
        for(let pa of pm.getActions()){
            switch (pa.type)
            {
                case ePlaceType.NONE:
                    break;
                case ePlaceType.ADD:
                    lcb.addNewChessUnSafe(pa.x, pa.y, pa.direction, pa.ownner);
                    break;
                case ePlaceType.MOVE:
                    //ai暂时不会移动
                    break;
                default:
                    break;
            }
        }

        return lcb;
    }
    public static getAllPlaceMethods(ownner : number,gridLevel : number,lcb : nLianQiLogic.ChessBoard) : Array<PlaceMethod>{
        let pms : Array<PlaceMethod> = [];
        //预制不下棋到选择里面去
        pms.push(new PlaceMethod().setNone());
        let udrs : Array<ProtocolDefine.nGame.nLianQi.eLianQiDirectionType> = nRule.getUsableDirection(lcb);
        for (var i = 0; i < 2 * gridLevel - 1; i++){
            //上半截
            if (i < gridLevel){
                for (var j = 0; j < i + gridLevel; j++){
                    let xx = i - gridLevel + 1;
                    let yy = j - gridLevel + 1;
                    let gvs : nLianQiLogic.eGridValidState = nRule.getGridValidState(lcb, xx, yy);
                    //如果此网格可以用
                    if (gvs == nLianQiLogic.eGridValidState.VOID){
                        for (var k = 0; k < udrs.length; k++){
                            pms.push(new PlaceMethod().addAction(ePlaceType.ADD, xx, yy, udrs[k], ownner));
                        }
                    }
                }
            }else{
                //下半截
                for (var j = i - gridLevel + 1; j < 2 * gridLevel - 1; j++){
                    let xx = i - gridLevel + 1;
                    let yy = j - gridLevel + 1;
                    let gvs : nLianQiLogic.eGridValidState = nRule.getGridValidState(lcb, xx, yy);
                    //如果此网格可以用
                    if (gvs == nLianQiLogic.eGridValidState.VOID){
                        for (var k = 0; k < udrs.length; k++){
                            pms.push(new PlaceMethod().addAction(ePlaceType.ADD, xx, yy, udrs[k], ownner));
                        }
                    }
                }
            }
        }

        return pms;
    }
    //lcb = nGame.Game.chessBoard -- 此处需要传递的是原始棋盘数据
    public static getRandomPlaceMethod(ownner : number,gridLevel : number,lcb : nLianQiLogic.ChessBoard) : PlaceMethod | null{
        let lcb2 : nLianQiLogic.ChessBoard = lcb.getCopy();
        let pms = PlaceMethodGenerator.getAllPlaceMethods(ownner,gridLevel,lcb2);
        while (pms.length > 0) {
            let rand = Math.floor(Math.random() * pms.length);
            let pm : PlaceMethod = pms[rand];
            if (pm.isValid(lcb2)){
                return pm;
            }else{
                pms.splice(rand,1);
            }
        }
        //出错了，不应该到这里
        return null;
    }
    public static getAllValidPlaceMethod(ownner : number,gridLevel : number,lcb : nLianQiLogic.ChessBoard) : Array<PlaceMethod>{
        let pms = PlaceMethodGenerator.getAllPlaceMethods(ownner,gridLevel,lcb);
        let pms2 : Array<PlaceMethod> = [];
        for(let pm of pms){
            if (pm.isValid(lcb)) {
                pms2.push(pm);
            }
        }
        return pms2;
    }
    //获取智能提示，准确率代表智能高低
    public static getPurchedMethods(ownner : number,gridLevel : number,lcb : nLianQiLogic.ChessBoard,
        purchRate : number,isAI : boolean) : Array<PlaceMethod>{
        let pms : Array<PlaceMethod> = PlaceMethodGenerator.getAllValidPlaceMethod(ownner,gridLevel,lcb);
        let purchNum : number = Math.floor(pms.length * purchRate);
        if (purchNum == pms.length) {
            purchNum--;
        }
        let results : Array<number> = [];
        for(let p of pms){
            let lcb2 : nLianQiLogic.ChessBoard = PlaceMethodGenerator.getPlacedChessBoard(p, lcb.getCopy());
            results.push(GameBoardEvaluator.evaluateGameBoard_MK0(lcb2));
        }
        if (isAI){
            //是ai，从小到大
            for (var i = 0; i < pms.length; i++){
                for (var j = i; j < pms.length; j++){
                    if (results[i] > results[j]) {
                        let temp : number = results[i];
                        results[i] = results[j];
                        results[j] = temp;
                        let pm : PlaceMethod = pms[i];
                        pms[i] = pms[j];
                        pms[j] = pm;
                    }
                }
            }
        }else{
            //是人，从大到小
            for (var i = 0; i < pms.length; i++){
                for (var j = i; j < pms.length; j++){
                    if (results[i] < results[j]){
                        let temp : number = results[i];
                        results[i] = results[j];
                        results[j] = temp;
                        let pm : PlaceMethod = pms[i];
                        pms[i] = pms[j];
                        pms[j] = pm;
                    }
                }
            }
        }
        for (var i = 0; i < purchNum; i++){
            pms.splice(pms.length - 1,1);
        }
        return pms;
    }

}
