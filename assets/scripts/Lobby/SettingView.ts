// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node, Sprite, Label, sp } from 'cc';
import { CommonDefine } from '../Define/CommonDefine';
import { LobbyEvent } from '../Event/LobbyEvent';
import { Utils } from '../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('SettingView')
export class SettingView extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;
    
    @property(Sprite)
    BgSndSelectedBg : Sprite = null;
    @property(Sprite)
	EffSndSelectedBg : Sprite = null;

    @property(Node)
    BgSndOn : Node = null;
    @property(Node)
    BgSndOff : Node = null;
    @property(Node)
    EffSndOn : Node = null;
    @property(Node)
	EffSndOff : Node = null;

    @property(Label)
    BgSndOnText : Label = null;
    @property(Label)
    BgSndOffText : Label = null;
    @property(Label)
    EffSndOnText : Label = null;
    @property(Label)
    EffSndOffText : Label = null;
    
    @property(Label)
    VersionInfo : Label = null;

    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
    onEnable(){
        //初始化声音设置
		this.initSndSetting();
    }
    public OnClickCloseBtn() : void{
		this.node.active = false;
    }

	public OnClickBgSndBtn(event : any,on : string) : void{
        this.setBgSnd(on == "1");
        Utils.setPlayerPrefs(LobbyEvent.EVENT.OPEN_CLOSE_BG_SND,on);
	}

	public OnClickEffSndBtn(event : any,on : string) : void{
        this.setEff(on == "1");
        Utils.setPlayerPrefs(LobbyEvent.EVENT.OPEN_CLOSE_EFFECT_SND,on);
	}
	private initSndSetting() : void{
        this.setEff(Utils.getPlayerPrefs(CommonDefine.SETTING_EFF_SNF,"1"));
        this.setBgSnd(Utils.getPlayerPrefs(CommonDefine.SETTING_BG_SND,"1"));
    }
    private setBgSnd(on : boolean) : void{
		if (on) {
			this.BgSndSelectedBg.node.position = this.BgSndOn.position;
			this.BgSndOnText.node.active = false;
			this.BgSndOffText.node.active = true;
		} else {
            this.BgSndSelectedBg.node.position = this.BgSndOff.position;
			this.BgSndOnText.node.active = true;
			this.BgSndOffText.node.active = false;
		}
    }
    private setEff(on : boolean) : void{
		if (on) {
            this.EffSndSelectedBg.node.position = this.EffSndOn.position;
			this.EffSndOnText.node.active = false;
            this.EffSndOffText.node.active = true;
            
		} else {
            this.EffSndSelectedBg.node.position = this.EffSndOff.position;
			this.EffSndOnText.node.active = true;
			this.EffSndOffText.node.active = false;
		}
    }
}
