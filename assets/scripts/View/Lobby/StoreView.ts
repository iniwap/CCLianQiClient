// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node } from 'cc';
import { LobbyEvent } from '../../Event/LobbyEvent';
import { Utils } from '../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('StoreView')
export class StoreView extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    start () {
        // Your initialization goes here.
    }

    onEnable(){
        Utils.getGlobalController()?.On(LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_STORE],
            this.OnUpdateStore.bind(this),this);
        this.OnUpdateStore();// 打开界面时，主动显示
    }

    onDisable(){
        Utils.getGlobalController()?.Off(LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_STORE],
            this.OnUpdateStore.bind(this),this);
    }
    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    public OnUpdateStore(arg0 = undefined,arg1 = undefined){
        //Lobby.Lobby.storeList
    }
}
