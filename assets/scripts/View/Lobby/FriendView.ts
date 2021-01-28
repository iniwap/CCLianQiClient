// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component } from 'cc';
import { LobbyEvent } from '../../Event/LobbyEvent';
import { Utils } from '../../Utils/Utils';
const { ccclass } = _decorator;

@ccclass('FriendView')
export class FriendView extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    start () {
        // Your initialization goes here.
    }
	onEnable(){
        Utils.getGlobalController()?.On(LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_FRIEND],
            this.OnUpdateFriend.bind(this),this);
		
		this.OnUpdateFriend();
    }

    onDisable(){
        Utils.getGlobalController()?.Off(LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_FRIEND],
            this.OnUpdateFriend.bind(this),this);
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
  
    public OnUpdateFriend(arg0 : any = undefined,arg1 : any = undefined) : void{
		//Lobby.Lobby.friendlist
	}
}
