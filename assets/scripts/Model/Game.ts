import { ProtocolDefine } from "../Define/ProtocolDefine";
import { nLianQiLogic } from "../GameLogic/LianQiLogic";
import { nRule } from "../GameLogic/Rule";

export namespace nGame{
	export class GameData{
		public static firstHandSeat : number = 255; //先手玩家
		public static currentTurn : number = 255;
		public static chessBoard : nLianQiLogic.ChessBoard | null = null;// 棋盘数据
		public static playerNum : number = 2;          //玩家人数
		public static boardLevel : number = 4;         //棋盘阶数
	
		public static reset() : void{
			this.currentTurn = 255;
			this.firstHandSeat = 255;
			this.playerNum = 2;//玩家人数
			this.boardLevel = 4;//棋盘阶数
			this.chessBoard = null;
		}
		public static getUsableDirection() : Array<ProtocolDefine.nGame.nLianQi.eLianQiDirectionType>{
            return nRule.getUsableDirection(this.chessBoard!);
		}
		public static tryToPlace(x : number,y : number,
			dir : ProtocolDefine.nGame.nLianQi.eLianQiDirectionType) : nLianQiLogic.ChessBoard | null{
            return nRule.getTryResult(this.chessBoard!.getCopy(), x, y, dir, this.currentTurn);
		}
		public static startGame(pn : number,bl : number) : void{
			this.playerNum = pn;
			this.boardLevel = bl;
            this.chessBoard = new nLianQiLogic.ChessBoard(this.boardLevel);
		}
		public static isThisGridEmpty(x : number,y : number) : boolean{
            let gvs : nLianQiLogic.eGridValidState = nRule.getGridValidState(this.chessBoard!, x, y);
            if (gvs == nLianQiLogic.eGridValidState.VOID) {
                return true;
            }

            return false;
		}
		public static changeTurn() : void{
            this.chessBoard!.endAction(this.currentTurn);
            nRule.cleanAttacks(this.chessBoard!);
		}
		//落子永远是回合方
		public static placeChess(x : number, y : number,
			dir : ProtocolDefine.nGame.nLianQi.eLianQiDirectionType) : boolean{
            let lcb : nLianQiLogic.ChessBoard = this.chessBoard!.getCopy();

            if (!nRule.tryPlaceChessToGameBoard(lcb,x,y, dir,this.currentTurn)){
                return false;
            }
			this.chessBoard!.addNewChess(x,y, dir, this.currentTurn);
			this.updateChessBoard();
            return true;
		}
		public static updateChessBoard() : void {
			nRule.GameBoardCalculateItself(this.chessBoard!);           

        }
	}

}