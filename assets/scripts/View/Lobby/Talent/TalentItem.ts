// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Button, resources, SpriteFrame, Sprite } from 'cc';
import { CommonDefine } from '../../../Define/CommonDefine';
import { nLobby } from '../../../Model/Lobby';
const { ccclass, property } = _decorator;

@ccclass('TalentItem')
export class TalentItem extends Component {
    @property(Button)
    public talentLockBtn! : Button;
    @property(Button)
    public talentCanInstallBtn! : Button;
    @property(Button)
	public talentHasInstalledBtn! : Button;

	private _btnState : nLobby.eTalentSlotState = nLobby.eTalentSlotState.TALENT_LOCK;
	private _talent : nLobby.eTalentType = nLobby.eTalentType.TALENT_NONE;
	private _tid : number = 0;
	private _tname : string = '';
    private _des : string = '';
    
    private _ClickTalentBtn! : (btnState : nLobby.eTalentSlotState,tid : number)=> void;

    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    public updateTalentItem(type : nLobby.eTalentType,tid : number,tname : string,
        des : string,btnState : nLobby.eTalentSlotState,
        tcb : (btnState : nLobby.eTalentSlotState,tid : number)=> void){

		this._talent = type;
		this._tid = tid;
		this._tname = tname;
        this._des = des;
        this._ClickTalentBtn = tcb;
	
		this.updateBtnState(btnState);
    }
    public updateBtnState(btnState : nLobby.eTalentSlotState) : void{

		this._btnState = btnState;

		switch (btnState) {
		case nLobby.eTalentSlotState.TALENT_LOCK:
			this.talentLockBtn.node.active = true;
			this.talentCanInstallBtn.node.active = false;
            this.talentHasInstalledBtn.node.active = false;
            resources.load(CommonDefine.ResPath.TALENT_LOCK_BTN + "/spriteFrame",SpriteFrame, (err, spriteFrame) => {
                this.talentLockBtn.getComponent(Sprite)!.spriteFrame = spriteFrame!;
                //spriteFrame.addRef();
            });
			break;
		case nLobby.eTalentSlotState.TALENT_CAN_INSTALL:
			this.talentLockBtn.node.active =  false;
			this.talentCanInstallBtn.node.active = true;
            this.talentHasInstalledBtn.node.active = false;
            resources.load(CommonDefine.ResPath.TALENT_CANINSTALL_BTN + "/spriteFrame",SpriteFrame, (err, spriteFrame) => {
                this.talentCanInstallBtn.getComponent(Sprite)!.spriteFrame = spriteFrame!;
                //spriteFrame.addRef();
            });
			break;
		case nLobby.eTalentSlotState.TALENT_INSTALLED:
			this.talentLockBtn.node.active = false;
			this.talentCanInstallBtn.node.active = false;
			this.talentHasInstalledBtn.node.active = true;

			//更新为对应的天赋图标
            resources.load(CommonDefine.ResPath.TALENT_ICON_BTN + this._talent + "/spriteFrame",SpriteFrame, (err, spriteFrame) => {
                this.talentHasInstalledBtn.getComponent(Sprite)!.spriteFrame = spriteFrame!;
                //spriteFrame.addRef();
            });

			break;
        }
    }
        
    public OnClickTalentBtn(){
        this._ClickTalentBtn(this._btnState,this._tid);
    }

    public getTalentType() : nLobby.eTalentType{
        return this._talent;
    }

    public getTalentName() : string{
        return this._tname;
    }

    public getTalentDes() : string{
        return this._des;
    }

    public getTalentID() : number{
        return this._tid;
    }

    public getTalentBtnState() : nLobby.eTalentSlotState{
        return this._btnState;
    }
}
