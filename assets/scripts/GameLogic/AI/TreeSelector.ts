import { nLianQiLogic } from "../LianQiLogic";
import { GameBoardEvaluator } from "./GameBoardEvaluator";
import { PlaceMethod } from "./PlaceMethod";
import { PlaceMethodGenerator } from "./PlaceMethodGenerator";

export class TreeSelector{
    //lcb = nGame.Game.chessBoard -- 此处需要传递的是原始棋盘数据
    public static getMinPlaceMethod_OL(ownner : number,gridLevel : number,lcb : nLianQiLogic.ChessBoard) : PlaceMethod{
        let pms : Array<PlaceMethod> = PlaceMethodGenerator.getAllValidPlaceMethod(ownner,gridLevel,lcb.getCopy());
        let lcb2 : nLianQiLogic.ChessBoard = lcb.getCopy();
        let lcbTemp : nLianQiLogic.ChessBoard = PlaceMethodGenerator.getPlacedChessBoard(pms[0], lcb2.getCopy());
        let minNum = 0;
        let minValue = GameBoardEvaluator.evaluateGameBoard_MK0(lcbTemp);
        let npm : Array<PlaceMethod> = [];
        npm.push(pms[0]);
        for (var i = 1; i < pms.length; i++){
            lcbTemp = PlaceMethodGenerator.getPlacedChessBoard(pms[i], lcb.getCopy());
            let temp = GameBoardEvaluator.evaluateGameBoard_MK0(lcbTemp);
            if (temp < minValue){
                minNum = i;
                minValue = temp;
                npm = [];
                npm.push(pms[i]);
            }else if (temp == minValue) {
                npm.push(pms[i]);
            }
        }

        let iend = Math.floor(Math.random() * npm.length);
        return npm[iend];
    }
    //lcb = nGame.Game.chessBoard -- 此处需要传递的是原始棋盘数据
    public static getBestMethodMultiLayer(ownner : number,gridLevel : number,lcb : nLianQiLogic.ChessBoard,
        layer : number) : PlaceMethod{
        let pms : Array<PlaceMethod> = PlaceMethodGenerator.getAllValidPlaceMethod(ownner,gridLevel,lcb);
        let results : Array<number> = [];
        for(let p of pms){
            results.push(TreeSelector.getBestResult(ownner,gridLevel,lcb.getCopy(), p, layer - 1, false));
        }
        let min = 0;
        let minvalue = results[0];
        for (var i = 1; i < results.length; i++){
            if (results[i] < minvalue){
                minvalue = results[i];
                min = i;
            }
        }
        return pms[min];
    }
    public static getBestResult(ownner : number,gridLevel : number,lcb : nLianQiLogic.ChessBoard,pm : PlaceMethod,layer : number,isAI : boolean) : number{
        if (layer <= 0){
            let lcbTemp : nLianQiLogic.ChessBoard = PlaceMethodGenerator.getPlacedChessBoard(pm, lcb);
            return GameBoardEvaluator.evaluateGameBoard_MK0(lcbTemp);
        }
        else {
            let lcbTemp : nLianQiLogic.ChessBoard = PlaceMethodGenerator.getPlacedChessBoard(pm, lcb);
            let pms : Array<PlaceMethod> = PlaceMethodGenerator.getAllValidPlaceMethod(ownner,gridLevel,lcbTemp);
            let results : Array<number> = [];
            for(let p of pms){
                results.push(TreeSelector.getBestResult(ownner,gridLevel,lcbTemp.getCopy(), p, layer - 1, !isAI));
            }

            if (isAI){
                let minvalue = results[0];
                for (var i = 1; i < results.length; i++){
                    if (results[i] < minvalue) {
                        minvalue = results[i];
                    }
                }
                return minvalue;
            }else{
                let maxvalue = results[0];
                for (var i = 1; i < results.length; i++){
                    if (results[i] > maxvalue){
                        maxvalue = results[i];
                    }
                }
                return maxvalue;
            }
        }
    }

    //#region 剪枝的
    //lcb = nGame.Game.chessBoard -- 此处需要传递的是原始棋盘数据
    public static getBestMethodMultiLayerPurge(ownner : number,gridLevel : number,lcb : nLianQiLogic.ChessBoard,
        layer : number,purge : number) : PlaceMethod{
        let pms : Array<PlaceMethod> = PlaceMethodGenerator.getPurchedMethods(ownner,gridLevel,lcb, purge, true);
        let results : Array<number> = [];
        for(let p of pms){
            results.push(TreeSelector.getBestResultPurge(ownner,gridLevel,lcb.getCopy(), p, layer - 1, false,purge));
        }
        let min = 0;
        let minvalue = results[0];
        for (var i = 1; i < results.length; i++){
            if (results[i] < minvalue){
                minvalue = results[i];
                min = i;
            }
        }
        return pms[min];
    }
    public static getBestResultPurge(ownner : number,gridLevel : number,lcb : nLianQiLogic.ChessBoard,
        pm : PlaceMethod,layer : number,isAI : boolean,purgeRate : number) : number{
        if (layer <= 0){
            let lcbTemp : nLianQiLogic.ChessBoard = PlaceMethodGenerator.getPlacedChessBoard(pm, lcb);
            return GameBoardEvaluator.evaluateGameBoard_MK0(lcbTemp);
        }else{
            let lcbTemp : nLianQiLogic.ChessBoard = PlaceMethodGenerator.getPlacedChessBoard(pm, lcb);
            let pms : Array<PlaceMethod> = PlaceMethodGenerator.getPurchedMethods(ownner,gridLevel,lcb, purgeRate, isAI);
            let results : Array<number> = [];
            for(let p of pms){
                results.push(TreeSelector.getBestResult(ownner,gridLevel,lcbTemp.getCopy(), p, layer - 1, !isAI));
            }

            if (isAI){
                let minvalue = results[0];
                for (var i = 1; i < results.length; i++){
                     if (results[i] < minvalue){
                        minvalue = results[i];
                    }
                }
                return minvalue;
            }else{
                let maxvalue = results[0];
                for (var i = 1; i < results.length; i++){
                    if (results[i] > maxvalue){
                        maxvalue = results[i];
                    }
                }
                return maxvalue;
            }
        }
    }
    //#endregion
}
