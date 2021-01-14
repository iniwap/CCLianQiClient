// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node, Vec2, Game, EventTouch, Button } from 'cc';
import { ProtocolDefine } from '../../Define/ProtocolDefine';
import { GameEvent } from '../../Event/GameEvent';
import { nGame } from '../../Model/Game';
import { Utils } from '../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('GameGrid')
export class GameGrid extends Component {
    private _pos : Vec2 = new Vec2(0,0);//棋格坐标
    private _gridID : number = 0;// 方便查找，不用每次循环
    @property(Button)
    public gridBtn! : Button;
    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    public updateGameGrid(x : number ,y : number,gid : number){
        this._pos.x = x;
        this._pos.y = y;
        this.gridBtn.interactable = false;//动画结束后才能点击
        this._gridID = gid;
    }
    public OnGridClick(event : any) : void {
        if (nGame.GameData.isThisGridEmpty(this._pos.x, this._pos.y)){
            return;
        }
        Utils.getGlobalController()?.Emit(GameEvent.EVENT[GameEvent.EVENT.PLACE_CHESS],this._pos,this._gridID);
    }
    public enableGrid(enable : boolean) : void{
        this.gridBtn.interactable = enable;
    }
    public getGridPos() : Vec2{
        return this._pos;
    }
    public getGridID() : number{
        return this._gridID;
    }
}
