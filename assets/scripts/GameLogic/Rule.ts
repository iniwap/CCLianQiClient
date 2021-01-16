//
//游戏规则逻辑
//
import {nLianQiLogic} from "./LianQiLogic"

export namespace nRule {
    //确定这个地方能否下子
    export const getGridValidState = function(board : nLianQiLogic.ChessBoard,
        xx : number,yy : number) : nLianQiLogic.eGridValidState{

        let boardSize : number = board.boardSize;
        //完全越界的情况
        if ((xx < 0 && xx < -boardSize) ||
            (xx > 0 && xx > boardSize) ||
            (yy < 0 && yy < -boardSize) ||
            (yy > 0 && yy > boardSize))
        {
            return nLianQiLogic.eGridValidState.OUTRANGE;
        }
        //两个尖角越界的情况
        if (xx > 0)
        {
            if (yy < xx - boardSize)
            {
                return nLianQiLogic.eGridValidState.INVALID;
            }
        }
        else if (xx < 0)
        {
            if (yy > boardSize + xx)
            {
                return nLianQiLogic.eGridValidState.INVALID;
            }
        }

        if (board.findChessByPosition(xx, yy) != null)
        {
            return nLianQiLogic.eGridValidState.USING;
        }

        return nLianQiLogic.eGridValidState.VOID;
    }
    export const washChessBoard = function(lcb : nLianQiLogic.ChessBoard) : nLianQiLogic.ChessBoard {
        for(let item of lcb.deads)
        {
            if (item.type == nLianQiLogic.eSpecialLinkType.DEAD) {
                let lc : nLianQiLogic.Chess | null = lcb.findChessByIdnum(item.fromIdm);
                if(lc != null){
                    let index = lcb.chesses.indexOf(lc);
                    if(index != -1){
                        lcb.chesses.splice(index,1);
                    }
                }
            }
        }
        GameBoardCalculateItself(lcb);
        
        return lcb;
    }
    export const getTryResult = function(board : nLianQiLogic.ChessBoard, 
        xx : number,yy : number,dir : number,playerId : number) : nLianQiLogic.ChessBoard | null {
        let gvs : nLianQiLogic.eGridValidState= getGridValidState(board, xx, yy);
        if (gvs != nLianQiLogic.eGridValidState.VOID){
            return null;
        }
        let idm : number = board.addNewChess(xx, yy, dir, playerId);
        if (idm < 0){
            return null;
        }
        GameBoardCalculateItself(board);
        return board;
    }
    export const tryPlaceChessToGameBoard = function(board : nLianQiLogic.ChessBoard, 
        xx : number,yy : number,dir : number,playerId : number) : boolean{
        let gvs : nLianQiLogic.eGridValidState = getGridValidState(board, xx, yy);
        if (gvs != nLianQiLogic.eGridValidState.VOID){
            return false;
        }
        
        for(let pm of board.places){
            if(dir == pm.chessDir){
                return false;//该方向为禁手方向
            }
        }

        let idm : number = board.addNewChess(xx, yy, dir, playerId);
        if(idm < 0){
            //此位置存在错误！
            return false;
        }

        GameBoardCalculateItself(board);

        if (board.findChessByIdnum(idm)!.health <= 0) {
            //下在此处生命值会不够！
            return false;
        }

        return true;
    }
    export interface IRingInfo {
        chess : nLianQiLogic.Chess;
        level : number;
    }
    export const hasChessThisInList = function(rfs : Array<IRingInfo>,lc : nLianQiLogic.Chess) : boolean{
        for(let r of rfs) {
            if (r.chess == lc) {
                return true;
            }
        }

        return false;
    }
    export const GameBoardCalculateItself = function(lcb : nLianQiLogic.ChessBoard) : void {
        let lcs : Array<nLianQiLogic.Chess> = lcb.chesses;
        //清空buff列表
        for(let l of lcs){
            l.buffers = [];
        }

        let rfs : Array<IRingInfo> = [];
        for(let l of lcs){
            if (hasChessThisInList(rfs,l)){
                continue;
            }
            else{
                checkRing(lcb, l.identityNumber, rfs);
            }
        }
        for(let r of rfs){
            let be : nLianQiLogic.IBufferEffect = {
                perfromChess : r.chess.identityNumber,
                acceptChess : r.chess.identityNumber,
                bfType : nLianQiLogic.eBufferType.RING,
                healthChange : r.level,
                attackChange : 0,
                absorbChange : 0
            };
            r.chess.buffers.push(be);
        }
        //重新获得buff列表（Basic，Thron，Kiss，Ring）
        for(let l of lcs){
            let hasFront: boolean = false;
            let hasBack : boolean = false;
            let fc : nLianQiLogic.Chess | null = null;
            let bc : nLianQiLogic.Chess | null = null;
            //获取前方棋子
            let pos : Array<number> = lcb.getPointPos(l.x, l.y, l.dir);
            let bh : number = 3;
            let gvs : nLianQiLogic.eGridValidState = getGridValidState(lcb, pos[0], pos[1]);

            if (gvs == nLianQiLogic.eGridValidState.USING){
                hasFront = true;
                fc = lcb.findChessByPosition(pos[0], pos[1]);
                if ( fc!= null){
                    if (fc.ownner != l.ownner){
                        bh--;
                    }
                }else{
                    //指向的格子上应该有棋子却找不到！！
                    return;
                }
            }
            else {
                hasFront = false;
            }
            //获取后方棋子
            let pos2 : Array<number> = lcb.getPointPos(l.x, l.y, (l.dir + 3) % 6);
            gvs = getGridValidState(lcb, pos2[0], pos2[1]);

            if (gvs == nLianQiLogic.eGridValidState.USING){
                hasBack = true;
                bc = lcb.findChessByPosition(pos2[0], pos2[1]);
                if (bc != null){
                    if (bc.ownner != l.ownner){
                        bh--;
                    }
                }else{
                    //指向的格子上应该有棋子却找不到！！
                    return;
                }
            }else{
                hasBack = false;
            }

            //增加基础buff
            let be : nLianQiLogic.IBufferEffect = {
                perfromChess : l.identityNumber,
                acceptChess : l.identityNumber,
                bfType : nLianQiLogic.eBufferType.BASIC,
                healthChange : bh,
                attackChange : 1,
                absorbChange : 0
            };
            l.buffers.push(be);
            
            //如果后背的是己方，并且方向和自己正好相反（背对背），增加双三的buff
            if (hasBack && bc!.ownner == l.ownner && (l.dir+3)%6 == bc!.dir) {
                let be : nLianQiLogic.IBufferEffect = {
                    perfromChess : bc!.identityNumber,
                    acceptChess : l.identityNumber,
                    bfType : nLianQiLogic.eBufferType.THRON,
                    healthChange : 0,
                    attackChange : 3,
                    absorbChange : 0
                };
                l.buffers.push(be);
            }
            //如果前面是友方，而且方向正好相对（面对面），加上吸收力增值
            if (hasFront && fc!.ownner== l.ownner && (l.dir + 3) % 6 == fc!.dir){
                l.buffers.push({
                    perfromChess : fc!.identityNumber,
                    acceptChess : l.identityNumber,
                    bfType : nLianQiLogic.eBufferType.ABSORBER,
                    healthChange : 0,
                    attackChange : 0,
                    absorbChange : 2
                });
                //如果有吸收，而且后方是敌人，就加一个吸收的debuff
                if (hasBack && bc!.ownner != l.ownner){
                    bc!.buffers.push({
                        perfromChess : l.identityNumber,
                        acceptChess : bc!.identityNumber,
                        bfType : nLianQiLogic.eBufferType.ABSORBER,
                        healthChange : 0,
                        attackChange : -2,
                        absorbChange : 0
                    });
                }
            }
            if (hasFront) {
                if (fc!.ownner == l.ownner) {
                    fc!.buffers.push({
                        perfromChess : l.identityNumber,
                        acceptChess : fc!.identityNumber,
                        bfType : nLianQiLogic.eBufferType.SUPPORT,
                        healthChange : 0,
                        attackChange : 0,
                        absorbChange : 0
                    });
                }
                else
                {
                    fc!.buffers.push({
                        perfromChess : l.identityNumber,
                        acceptChess : fc!.identityNumber,
                        bfType : nLianQiLogic.eBufferType.ATTACK,
                        healthChange : 0,
                        attackChange : 0,
                        absorbChange : 0
                    });
                }
            }

            let be2 : nLianQiLogic.IBufferEffect | null = l.getSuchBuff(nLianQiLogic.eBufferType.BASIC);
            if ( be2 != null){
                l.health = be2.healthChange;
                l.absorb = 0;
                l.attack = be2.attackChange;
            }
            else {
                //严重错误，没有基础buff
            }

            be2 = l.getSuchBuff(nLianQiLogic.eBufferType.THRON);
            if (be2 != null){
                l.attack = be2.attackChange;
            }

            be2 = l.getSuchBuff(nLianQiLogic.eBufferType.ABSORBER);
            if (be2 != null){
                l.absorb = be2.absorbChange;
            }

            be2 = l.getSuchBuff(nLianQiLogic.eBufferType.RING);
            if (be2 != null) {
                l.health += be2.healthChange;
            }
            //此处不能更新被吸收的buff,因为这个时候可能没加上
        }
        //减少基本攻击力，最小到0
        for(let l of lcs){
            let be3 : nLianQiLogic.IBufferEffect | null = l.getSuchBuff(nLianQiLogic.eBufferType.ABSORBEE);
            if (be3 != null) {
                l.attack += be3.attackChange;
                if (l.attack < 0) {
                    l.attack = 0;
                }
            }
        }
        //更新互助列表
        for(let l of lcs){
            let bes : Array<nLianQiLogic.IBufferEffect> = l.getSuchBuffAll(nLianQiLogic.eBufferType.SUPPORT);
            for(let bfe of bes){
                let nc : nLianQiLogic.Chess | null = lcb.findChessByIdnum(bfe.perfromChess);
                if (nc == null) {
                    //重大错误！！ 找不到本能找到的棋子！
                    return;
                }
                bfe.attackChange = nc.attack;
                bfe.absorbChange = 0;
                bfe.healthChange = 1;
            }
        }
        //更新攻击列表，直接减少生命
        for(let l of lcs){
            let bes : Array<nLianQiLogic.IBufferEffect>= l.getSuchBuffAll(nLianQiLogic.eBufferType.SUPPORT);
            for(let bfe of bes){
                l.attack += bfe.attackChange;
                l.health += bfe.healthChange;
            }
        }

        for(let l of lcs){
            let bes : Array<nLianQiLogic.IBufferEffect> = l.getSuchBuffAll(nLianQiLogic.eBufferType.ATTACK);
            for(let bfe of bes){
                let nc : nLianQiLogic.Chess | null = lcb.findChessByIdnum(bfe.perfromChess);
                if (nc == null){
                    //重大错误！！ 找不到本能找到的棋子！
                    return;
                }
                l.health -= nc.attack;
            }
        }

        lcb.attacks = [];
        lcb.skills = [];
        lcb.deads = [];

        let tscl : Array<nLianQiLogic.ISpecialChessLink> = [];
        for(let lc of lcb.chesses) {
            if (lc.health <= 0) {
                lcb.deads.push({
                    fromIdm : lc.identityNumber,
                    toIdm : lc.identityNumber,
                    type : nLianQiLogic.eSpecialLinkType.DEAD
                });
                let bes : Array<nLianQiLogic.IBufferEffect> = lc.buffers;
                for(let be of bes) {
                    if (be.bfType == nLianQiLogic.eBufferType.ATTACK) {
                        tscl.push({fromIdm : be.perfromChess,toIdm : be.acceptChess,type : nLianQiLogic.eSpecialLinkType.ATTACK});
                    }
                }
            }
        }

        for(let scl of tscl) {
            if (lcb.deads.indexOf(scl) == -1) {
                lcb.attacks.push(scl);
            }
        }
    }

    export const checkRing = function(boardRef : nLianQiLogic.ChessBoard,idm : number,rfs : Array<IRingInfo>) : void{
        let l : nLianQiLogic.Chess | null = boardRef.findChessByIdnum(idm);
        if (l == null){
            //严重错误！ 找不到的开始值！
            return;
        }
        let fc : nLianQiLogic.Chess | null= boardRef.findChessInDir(l.x, l.y, l.dir);
        //l指向的不为空，fc是己方
        if (fc != null && fc.ownner == l.ownner){
            getNextLength(fc, l, boardRef, 0, rfs);
        }
        return;
    }
    //递归函数
    export const getNextLength = function(origin : nLianQiLogic.Chess,thisC  : nLianQiLogic.Chess, 
        boardRef : nLianQiLogic.ChessBoard,depth : number, rfs : Array<IRingInfo>) : number{
        //当递归回到了头的时候-->返回长度
        if (thisC == origin){
            rfs.push({chess : thisC,level : depth + 1});
            return depth+1;
        }

        if (depth > 10) {
            //环过长
            return -1;
        }
        //对于所有五种方向进行判断（除了自己指向的方向）
        for (var i = 0; i < 6; i++){
            if (thisC.dir == i){
                continue;
            }
            //获得现在这个方向的棋子
            let nc : nLianQiLogic.Chess | null = boardRef.findChessInDir(thisC.x, thisC.y, i);
            if (nc != null && nc.ownner == thisC.ownner){
                //如果非空则找这个棋子指向的对象
                let nc2 : nLianQiLogic.Chess | null = boardRef.findChessInDir(nc.x, nc.y, nc.dir);
                //如果这个棋子指向自己
                if (nc2 == thisC){
                    //对这个方向进行搜索
                    let result = getNextLength(origin, nc, boardRef, depth + 1, rfs);
                    //递归回来的结果如果是可用的
                    if (result > 0){
                        rfs.push({chess : thisC,level : result});
                        return result;
                    }
                    //否则继续找其他方向
                }
            }
        }
        //如果这里所有方向都不行，则返回不可用的-1
        return -1;
    }
    export const getTryEndBoard = function(chessIdentityNumber : number,
        lcb : nLianQiLogic.ChessBoard) : nLianQiLogic.ChessBoard | null {

        let lc : nLianQiLogic.Chess | null = lcb.findChessByIdnum(chessIdentityNumber);
        if(lc == null) return null;
        let pos : Array<number> = lcb.getPointPos(lc.x, lc.y, lc.dir);
        let gvs : nLianQiLogic.eGridValidState = getGridValidState(lcb, pos[0], pos[1]);

        if (gvs != nLianQiLogic.eGridValidState.VOID){
            return null;
        }else{
            let lcb2 : nLianQiLogic.ChessBoard = lcb.getCopy();
            let lc2 : nLianQiLogic.Chess | null = lcb2.findChessByIdnum(lc.identityNumber);
            if (lc2 == null){
                //严重错误
                return null;
            }
            lc2.x = pos[0];
            lc2.y = pos[1];

            GameBoardCalculateItself(lcb2);
            return lcb2;
        }
    }
    export const getTryChessesEndBoard = function(chessIdentityNumbers : Array<number>,
        lcb : nLianQiLogic.ChessBoard) : nLianQiLogic.ChessBoard | null{

        let lcb2 : nLianQiLogic.ChessBoard = lcb.getCopy();
        for(let co of chessIdentityNumbers) {
            //获取新棋子
            let lc : nLianQiLogic.Chess | null = lcb.findChessByIdnum(co);
            if(lc == null) return null;

            let pos : Array<number> = lcb.getPointPos(lc.x, lc.y, lc.dir);
            let gvs : nLianQiLogic.eGridValidState = getGridValidState(lcb, pos[0], pos[1]);

            if (gvs != nLianQiLogic.eGridValidState.VOID){
                return null;
            }else{
                //棋子存在而且位置可用
                let lc2 : nLianQiLogic.Chess | null = lcb2.findChessByIdnum(lc.identityNumber);
                //移动棋子
                if (lc2 == null){
                    //不可移动的时候严重错误
                    return null;
                }
                lc2.x = pos[0];
                lc2.y = pos[1];
            }
        }
        GameBoardCalculateItself(lcb2);
        return lcb2;
    }

    export const moveChessInBoard = function(lc : nLianQiLogic.Chess,lcb : nLianQiLogic.ChessBoard) : boolean{
        let pos : Array<number> = lcb.getPointPos(lc.x, lc.y, lc.dir);
        let gvs : nLianQiLogic.eGridValidState = getGridValidState(lcb, pos[0], pos[1]);
        if (gvs != nLianQiLogic.eGridValidState.VOID){
            return false;
        }else{
            let lcb2 : nLianQiLogic.ChessBoard = lcb.getCopy();
            let lc2 : nLianQiLogic.Chess | null = lcb2.findChessByIdnum(lc.identityNumber);
            if (lc2 == null){
                //严重错误
                return false;
            }
            lc2.x = pos[0];
            lc2.y = pos[1];
            GameBoardCalculateItself(lcb2);
            if (lc2.health <= 0) {
                return false;
            }
            lc.x = pos[0];
            lc.y = pos[1];
            GameBoardCalculateItself(lcb);
        }
        return true;
    }
    export const moveChessInBoardUnsafe = function(lc : nLianQiLogic.Chess,lcb : nLianQiLogic.ChessBoard) : boolean{
        let pos : Array<number> = lcb.getPointPos(lc.x, lc.y, lc.dir);
        lc.x = pos[0];
        lc.y = pos[1];
        GameBoardCalculateItself(lcb);
        return true;
    }
    export const cleanAttacks = function(lcb : nLianQiLogic.ChessBoard) : void{
        washChessBoard(lcb);
        lcb.skills = [];
        lcb.deads = [];
        lcb.attacks = [];
        for(let lc of lcb.chesses) {
            lc.buffers = [];
        }
    }
    export const getUsableDirection = function(lcb : nLianQiLogic.ChessBoard) : Array<number>{
       let ud : Array<number> =[];
        for (var i = 0; i < 6; i++){
            ud.push(i);
        }
        for(let item of lcb.places){
            if (item.placeOwnner >= 0) {
                let index = ud.indexOf(item.chessDir);
                if(index != -1){
                    ud.splice(index,1);
                }
            }
        }
        return ud;
    }
}
