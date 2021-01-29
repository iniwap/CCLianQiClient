import { nLianQiLogic } from "../LianQiLogic";
import { nRule } from "../Rule";

export class GameBoardEvaluator{
    public static evaluateGameBoard_MK0(lcb : nLianQiLogic.ChessBoard) : number{
        let result = 0;
        nRule.GameBoardCalculateItself(lcb);
        let chesses : Array<nLianQiLogic.Chess> = lcb.chesses;
        for(let lc of chesses){
            let thisone = 3;
            let POrN = 1;
            //对于0玩家，分数是增加的，1玩家分数是减少的
            POrN = lc.ownner == 0 ? 1 : -1;

            thisone += lc.hasSuchBuff(nLianQiLogic.eBufferType.THRON) ? 3 : 0;
            thisone += lc.hasSuchBuff(nLianQiLogic.eBufferType.RING) ? 3 : 0;
            thisone += lc.hasSuchBuff(nLianQiLogic.eBufferType.SUPPORT) ? 1 : 0;
            thisone += lc.hasSuchBuff(nLianQiLogic.eBufferType.ATTACK) ? -1 : 0;

            if (lc.health <= 0){
                thisone -= 6;
            }
            result += thisone * POrN;
        }

        return result;
    }
}
