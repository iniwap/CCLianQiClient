// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node } from 'cc';
import { LobbyEvent } from '../../Event/LobbyEvent';
import { Utils } from '../../Utils/Utils';
import { LobbyView } from './LobbyView';
import { PlazaRoomView } from './PlazaRoom/PlazaRoomView';
import { RoomWaitMatchView } from './RoomWaitMatchView';
import { TalentView } from './TalentView';
const { ccclass, property } = _decorator;

@ccclass('LobbyManager')
export class LobbyManager extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;
    @property(PlazaRoomView)
    public plazaRoomPanel !: PlazaRoomView ;//房间和场列表界面
    @property(LobbyView)
    public lobbyPanel !: LobbyView ;//主大厅界面
    @property(TalentView)
	public talentPanel !: TalentView;//天赋配置

	@property(RoomWaitMatchView)
	public roomWaitMatchPanel !: RoomWaitMatchView;//等待游戏匹配

    private _currentLobbyPanel : LobbyEvent.eLobbyPanel = LobbyEvent.eLobbyPanel.LOBBY_LOBBY_PANEL;
    
    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
    onEnable(){
		this.addAllEvent();
		this.showCurrentLobbyPanel(true);
	}
	onDisable(){   
		this.removeAllEvent();
		this.showCurrentLobbyPanel(false);
	}
	//--------------------------一些操作------------------------------------------------------
	 private addAllEvent(){
        Utils.getGlobalController()?.On(LobbyEvent.EVENT[LobbyEvent.EVENT.SHOW_LOBBY_PANEL],
            this.onShowLobbyPanel.bind(this),this);
	}
	private removeAllEvent(){
        Utils.getGlobalController()?.Off(LobbyEvent.EVENT[LobbyEvent.EVENT.SHOW_LOBBY_PANEL],
            this.onShowLobbyPanel.bind(this),this);
	}
    public onShowLobbyPanel(to : LobbyEvent.eLobbyPanel){
		if(this._currentLobbyPanel == to) return;

		if (this._currentLobbyPanel == LobbyEvent.eLobbyPanel.LOBBY_LOBBY_PANEL) {
			this.lobbyPanel.node.active = false;
			switch (to) {
			case LobbyEvent.eLobbyPanel.LOBBY_PLAZAROOM_PLAZA_PANEL:
			case LobbyEvent.eLobbyPanel.LOBBY_PLAZAROOM_ROOM_PANEL:
				this.plazaRoomPanel.onHidePlazaRoomPanel(false);
				break;
			case LobbyEvent.eLobbyPanel.LOBBY_TALENT_PANEL:
				this.talentPanel.onHideTalentPanel (false);
				break; 
			case LobbyEvent.eLobbyPanel.LOBBY_ROOMWAITMATCH_PANEL:
				this.roomWaitMatchPanel.OnHidePanel(false);
				break; 
			}
		} else if(this._currentLobbyPanel == LobbyEvent.eLobbyPanel.LOBBY_PLAZAROOM_PLAZA_PANEL
			||this._currentLobbyPanel == LobbyEvent.eLobbyPanel.LOBBY_PLAZAROOM_ROOM_PANEL) {
			this.plazaRoomPanel.onHidePlazaRoomPanel(true);
			switch (to) {
			case LobbyEvent.eLobbyPanel.LOBBY_LOBBY_PANEL:
				this.lobbyPanel.node.active = true;
				break;
			case LobbyEvent.eLobbyPanel.LOBBY_ROOMWAITMATCH_PANEL:
				this.roomWaitMatchPanel.OnHidePanel(false);
				break;
			}
		}else if(this._currentLobbyPanel == LobbyEvent.eLobbyPanel.LOBBY_TALENT_PANEL) {
			this.talentPanel.onHideTalentPanel(true);
			switch (to) {
			case LobbyEvent.eLobbyPanel.LOBBY_LOBBY_PANEL:
				this.lobbyPanel.node.active = true;
				break;
			}
		}else if(this._currentLobbyPanel == LobbyEvent.eLobbyPanel.LOBBY_ROOMWAITMATCH_PANEL) {
			this.roomWaitMatchPanel.OnHidePanel(true);
			switch (to) {
			case LobbyEvent.eLobbyPanel.LOBBY_LOBBY_PANEL:
				this.lobbyPanel.node.active = true;
				break;
			case LobbyEvent.eLobbyPanel.LOBBY_PLAZAROOM_PLAZA_PANEL:
				this.plazaRoomPanel.onHidePlazaRoomPanel(false);
				break;
			}
		}

		this._currentLobbyPanel = to;
	}

	public showCurrentLobbyPanel(show : boolean) : void{
		if (show) {
			this.onShowLobbyPanel(this._currentLobbyPanel);
		} else {
			this.onShowLobbyPanel(this._currentLobbyPanel);
		}
	}
}
