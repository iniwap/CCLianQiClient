// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node } from 'cc';
import { GameEvent } from '../../Event/GameEvent';
import { RoomEvent } from '../../Event/RoomEvent';
import { NetwokState } from '../../Utils/NetwokState';
import { Utils } from '../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('GameView')
export class GameView extends NetwokState {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
    onEnable(){
        super.onEnable();
        Utils.getGlobalController()?.On(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_ROOMRULE],
            this.OnUpdateRoomRule.bind(this),this);

        Utils.getGlobalController()?.OnNotifyStartGame(true);
    }

    onDisable(){
        super.onDisable();
        Utils.getGlobalController()?.Off(RoomEvent.EVENT[RoomEvent.EVENT.UPDATE_ROOMRULE],
            this.OnUpdateRoomRule.bind(this),this);
    }

    onLoad(){

    }

    public OnUpdateRoomRule(data : RoomEvent.IUpdateRoomRule){

    }
}
