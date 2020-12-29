// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node, Sprite, Label} from 'cc';
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
    BgSndSelectedBg! : Sprite;
    @property(Sprite)
	EffSndSelectedBg! : Sprite;

    @property(Node)
    BgSndOn! : Node;
    @property(Node)
    BgSndOff! : Node;
    @property(Node)
    EffSndOn! : Node;
    @property(Node)
	EffSndOff! : Node;

    @property(Label)
    BgSndOnText! : Label;
    @property(Label)
    BgSndOffText! : Label;
    @property(Label)
    EffSndOnText! : Label;
    @property(Label)
    EffSndOffText! : Label;
    
    @property(Label)
    VersionInfo! : Label;

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
        Utils.setPlayerPrefs(CommonDefine.SETTING_BG_SND,on);
        console.log("OnClickBgSndBtn====>" + on);
	}

	public OnClickEffSndBtn(event : any,on : string) : void{
        this.setEff(on == "1");
        Utils.setPlayerPrefs(CommonDefine.SETTING_EFF_SNF,on);
	}
	private initSndSetting() : void{
        console.log("初始化："+Utils.getPlayerPrefs(CommonDefine.SETTING_EFF_SNF,"1"));
        this.setEff(Utils.getPlayerPrefs(CommonDefine.SETTING_EFF_SNF,"1") == "1");
        this.setBgSnd(Utils.getPlayerPrefs(CommonDefine.SETTING_BG_SND,"1" == "1"));
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
