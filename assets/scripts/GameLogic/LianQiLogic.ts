//
//联棋游戏逻辑
//
import { nRule } from "./Rule"

export namespace nLianQiLogic{
    export enum eGridValidState{
        VOID,
        USING,
        INVALID,
        OUTRANGE,
    }
    export enum eBufferType {
        BASIC,
        SUPPORT,
        ATTACK,
        THRON,
        RING,
        ABSORBER,
        ABSORBEE,
    }
    export interface IBufferEffect {
        perfromChess : number;
        acceptChess : number;
        bfType : eBufferType;
        healthChange : number;
        attackChange : number;
        absorbChange : number;
    }

    export class Chess
    {
        public identityNumber : number = 0;
        public x : number = 0;
        public y : number = 0;
        public dir : number = 0;
        public ownner : number = 0;
        public health : number = 0;
        public attack : number = 0;
        public absorb : number =0;
        public buffers : Array<IBufferEffect> = [];

        public constructor(xx : number,yy : number,dd : number,oo : number,idnum : number) {
            this.x = xx;
            this.y = yy;
            this.dir = dd;
            this.ownner = oo;
            this.health = 0;
            this.attack = 0;
            this.absorb = 0;
            this.buffers = [];
            this.identityNumber = idnum;
        }
        //通过坐标比较是否是同一个棋子
        public isPosEqual(xx : number,yy : number) : boolean{
            if (this.x == xx && this.y == yy) {
                return true;
            }
            return false;
        }
        public isIDEqual(nid : number) : boolean {
            return nid == this.identityNumber;
        }
        public getSuchBuff(bt : eBufferType) : IBufferEffect | null{
            for (var i = 0;i <this.buffers.length;i++) {
                if (this.buffers[i].bfType == bt) {
                    return this.buffers[i];
                }
            }
            return null;
        }
        public getSuchBuffAll(bt : eBufferType) : Array<IBufferEffect>{
            let bes : Array<IBufferEffect> = [];
            for (var i = 0;i < this.buffers.length;i++) {
                if (this.buffers[i].bfType == bt) {
                    bes.push(this.buffers[i]);
                }
            }
            return bes;
        }
        public hasSuchBuff(bt : eBufferType) : boolean{
            for (var i = 0;i < this.buffers.length;i++) {
                if (this.buffers[i].bfType == bt) {
                    return true;
                }
            }
            return false;
        }
        public getCopy() : Chess{
            let lc : Chess = new Chess(this.x,this.y,this.dir,this.ownner,this.identityNumber);
            lc.health = this.health;
            lc.absorb = this.absorb;
            lc.attack = this.attack;
            for(let be of this.buffers) {
                lc.buffers.push({
                    perfromChess : be.perfromChess,
                    acceptChess : be.acceptChess,
                    bfType : be.bfType,
                    healthChange : be.healthChange,
                    attackChange : be.attackChange,
                    absorbChange : be.absorbChange
                });
            }

            return lc;
        }
    }
    export enum eChessBoardState {
        HEALTH,
        POSITION_MIXED,
        ID_MIXED,
    }
    export interface IChessBoardStateInfo {
        state : eChessBoardState;
        info : string;
    }
    export enum eSpecialLinkType {
        DEAD,
        ATTACK,
        SKILL,
    }
    export interface ISpecialChessLink
    {
        fromIdm : number;
        toIdm : number;
        type : eSpecialLinkType;
    }

    export interface IPlaceMemory {
        placeOwnner : number;
        chessID : number;
        chessDir : number;
    }
    export class ChessBoard
    {
        public boardSize : number = 0;   //棋盘尺寸
        public chesses : Array<Chess> = [];
        public deads : Array<ISpecialChessLink> = [];
        public attacks : Array<ISpecialChessLink> = [];
        public skills : Array<ISpecialChessLink> = [];
        public places : Array<IPlaceMemory> = [];
        private identityNumberNow : number = 0;
        public roundNum: number = 0;
        public banDirNum : number = 0;//0 为不开启禁方向，其他数字为开启禁几个

        public constructor(level : number,banDir : number = 2) {
            this.boardSize = level;
            this.chesses = [];
            this.places = [];
            this. deads = [];
            this. attacks = [];
            this.skills = [];
            this.identityNumberNow = 0;
            this.roundNum = 0;
            this.banDirNum = banDir;//禁手为0的时候，places记录不起作用
        }

        //根据位置找棋子
        public findChessByPosition(xx : number,yy : number) : Chess | null{
            for (let lc of this.chesses){
                if (lc.isPosEqual(xx, yy)){
                    return lc;
                }
            }
            return null;
        }

        private static getPointX(x : number,dir : number) : number{
            switch (dir){
                case 0: return x - 1;
                case 1: return x;
                case 2: return x + 1;
                case 3: return x + 1;
                case 4: return x;
                case 5: return x - 1;
                default:
                    break;
            }
            return -1;
        }

        private static getPointY(y : number,dir : number) : number{
            switch (dir){
                case 0: return y;
                case 1: return y + 1;
                case 2: return y + 1;
                case 3: return y;
                case 4: return y - 1;
                case 5: return y - 1;
                default:
                    break;
            }
            return -1;
        }

        public getPointPos(xx : number,yy : number,dir : number) : Array<number> {
            let re : Array<number> = [0,0];
            re[0] = ChessBoard.getPointX(xx, dir);
            re[1] = ChessBoard.getPointY(yy, dir);
            return re;
        }

        public findChessInDir(xx : number,yy : number,dir : number) : Chess | null{
            let fx : number = 0, fy : number = 0;
            fx = ChessBoard.getPointX(xx, dir);
            fy = ChessBoard.getPointY(yy, dir);

            for(let lc of this.chesses){
                if (lc.isPosEqual(fx, fy)){
                    return lc;
                }
            }
            return null;
        }

        //根据ID找棋子
        public findChessByIdnum(idn : number) : Chess | null {
            for(let lc of this.chesses){
                if (lc.isIDEqual(idn)){
                    return lc;
                }
            }
            return null;
        }

        public checkChessBoardState() : IChessBoardStateInfo{
            let cbsi : IChessBoardStateInfo = {
                state : eChessBoardState.HEALTH,
                info : ""
            };
            for (var i = 0; i < this.chesses.length; i++)
            {
                for (var j = i+1; j < this.chesses.length; j++)
                {
                    if (this.chesses[i].isIDEqual(this.chesses[j].identityNumber))
                    {
                        cbsi.state = eChessBoardState.ID_MIXED;
                        cbsi.info = i + "、"+ j +"棋子ID" + this.chesses[i].identityNumber+ "重复！";
                        return cbsi;
                    }
                    if (this.chesses[i].isPosEqual(this.chesses[j].x,this.chesses[j].y))
                    {
                        cbsi.state = eChessBoardState.ID_MIXED;
                        cbsi.info = i + "、"+ j +"棋子位置" + this.chesses[i].x +"/"+ this.chesses[i].y+ "重合!";
                        return cbsi;
                    }
                }
            }
            cbsi.state = eChessBoardState.HEALTH;
            cbsi.info = "棋子全部正常!";
            return cbsi;
        }

        public makeNewChess(xx : number,yy : number,dir : number,ownner : number) : number{
            let nlc : Chess = new Chess(xx, yy, dir, ownner, this.identityNumberNow);
            this.chesses.push(nlc);
            this.identityNumberNow++;
            return this.identityNumberNow - 1;
        }

        public addForbiddenDir(dir : number,ownner : number) : void{
            let dirs : Array<number> = nRule.getUsableDirection(this);
            let pm : IPlaceMemory = {
                placeOwnner : ownner,
                chessID : this.identityNumberNow,
                chessDir : dir
            };
            this.places.push(pm);
            if (this.places.length > this.banDirNum)
            {
                this.places.splice(0,1);
            }
        }

        public addNewChessUnSafe(xx : number,yy : number,dir : number,ownner : number) : number{
            let nlc : Chess = new Chess(xx, yy, dir, ownner, this.identityNumberNow);
            this.chesses.push(nlc);
            let pm : IPlaceMemory = {
                placeOwnner : ownner,
                chessID : this.identityNumberNow,
                chessDir : dir
            };
            this.places.push(pm);
            if (this.places.length > this.banDirNum)
            {
                this.places.splice(0,1);
            }
            this.identityNumberNow++;
            return this.identityNumberNow - 1;
        }

        public addNewChess(xx : number,yy : number,dir : number,ownner : number) : number{
            let nlc : Chess = new Chess(xx, yy, dir, ownner, this.identityNumberNow);
            this.chesses.push(nlc);

            let cbsi : IChessBoardStateInfo = this.checkChessBoardState();

            if (cbsi.state != eChessBoardState.HEALTH) {
                this.chesses.splice(this.chesses.indexOf(nlc),1);
                return -1;
            }

            let dirs : Array<number> = nRule.getUsableDirection(this);
            if (dirs.indexOf(dir) == -1) {
                this.chesses.splice(this.chesses.indexOf(nlc),1);
                return -2;
            }

            let pm : IPlaceMemory = {
                placeOwnner : ownner,
                chessID : this.identityNumberNow,
                chessDir : dir
            };
            this.places.push(pm);
            if (this.places.length > this.banDirNum)
            {
                this.places.splice(0,1);
            }

            this.identityNumberNow++;
            return this.identityNumberNow - 1;
        }

        public endAction(np : number) : void{
            //空操作，即没有落子，直接结束回合的，不记录方向
            // let ss : number = this.places.length;
            // let pm : IPlaceMemory = {
            //     placeOwnner : -1,
            //     chessID : -1,
            //     chessDir : -1
            // };
            // if (ss == 0) {
            //     this.places.push(pm);
            // }
            // else if (ss == 1 && np != this.places[0].placeOwnner) {
            //     this.places.push(pm);
            // }
            // else if (ss == 2 && np != this.places[1].placeOwnner) {
            //     this.places.push(pm);
            //     this.places.splice(0,1);
            // }
            this.roundNum++;
        }
        public getRoundNum() : number{
            return this.roundNum;
        }
        public getCopy() : ChessBoard{
            let lcb : ChessBoard = new ChessBoard(this.boardSize,this.banDirNum);
            lcb.identityNumberNow = this.identityNumberNow;
            for(let lc of this.chesses) {
                lcb.chesses.push(lc.getCopy());
            }
            for(let pm of this.places) {
                lcb.places.push({placeOwnner : pm.placeOwnner,chessID : pm.chessID,chessDir : pm.chessDir});
            }

            for(let sc of this.deads) {
                lcb.deads.push({fromIdm : sc.fromIdm,toIdm : sc.toIdm,type : sc.type});
            }
            for(let sc of this.attacks){
                lcb.attacks.push({fromIdm : sc.fromIdm,toIdm : sc.toIdm,type : sc.type});
            }
            for(let sc of this.skills){
                lcb.skills.push({fromIdm : sc.fromIdm,toIdm : sc.toIdm,type : sc.type});
            }
            lcb.roundNum = this.roundNum;

            return lcb;
        }
    }
};
