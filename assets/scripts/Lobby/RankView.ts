// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node } from 'cc';
import { ProtocolDefine } from '../Define/ProtocolDefine';
import { LobbyEvent } from '../Event/LobbyEvent';
import { Lobby } from '../Model/Lobby';
import { Utils } from '../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('RankView')
export class RankView extends Component {
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
        let e : string = LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_RANK];
        Utils.getGlobalController()?.On(e,this.OnUpdateRank.bind(this));
        //this.OnUpdateRank();// 打开界面时，主动显示
        //需要打开时请求数据
        let e2 : string = LobbyEvent.EVENT[LobbyEvent.EVENT.SHOW_RANK];        
        Utils.getGlobalController()?.Emit(e2,ProtocolDefine.nLobby.nRank.eRankScopeType.RANK_AREA,ProtocolDefine.nLobby.nRank.eRankType.RANK_GOLD);
    }

    onDisable(){
        let e : string = LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_RANK];
        Utils.getGlobalController()?.Off(e,this.OnUpdateRank.bind(this));
    }
    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    public OnUpdateRank(rankList : Array<Lobby.Rank>,arg1 : any = undefined){

    }
}
