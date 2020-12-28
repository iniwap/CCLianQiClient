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

@ccclass('PlazaRoomView')
export class PlazaRoomView extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    start () {
        // Your initialization goes here.
    }

    onEnable(){
        let e : string = LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_PLAZA];
        Utils.getGlobalController()?.On(e,this.OnUpdatePlaza.bind(this));
        this.OnUpdatePlaza();// 打开界面时，主动显示
    }

    onDisable(){
        let e : string = LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_PLAZA];
        Utils.getGlobalController()?.Off(e,this.OnUpdatePlaza.bind(this));
    }
    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
    private OnUpdatePlaza(arg0 = undefined,arg1 = undefined) : void{
		let plazaList : Array<Lobby.Plaza> = [];
		for (var i = 0; i < Lobby.LobbyData.plazaList.length; i++) {
			if(Lobby.LobbyData.plazaList[i].roomType == ProtocolDefine.nRoom.eCreateRoomType.ROOM_PLAZA){
				plazaList.push(Lobby.LobbyData.plazaList[i]);
			}
        }
        
		// RectTransform rt = _plazaRoot.gameObject.GetComponent<RectTransform>();
		// rt.sizeDelta = new Vector2(plazaList.Count*_plazaInteral, rt.sizeDelta.y);

		// removeAllPlaza ();

		// for(int i = 0;i<plazaList.Count;i++){
		// 	_realPlaza.Add( createPlaza (i,plazaList[i]));
		// }
    }
}
