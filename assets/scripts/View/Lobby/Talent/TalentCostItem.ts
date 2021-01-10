// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, RichText } from 'cc';
import { Lobby } from '../../../Model/Lobby';
const { ccclass, property } = _decorator;

@ccclass('TalentCostItem')
export class TalentCostItem extends Component {
    @property(RichText)
    public costName! : RichText;
    @property(RichText)
    public costNum! : RichText;
    
	private _talent : Lobby.eTalentType = Lobby.eTalentType.TALENT_NONE;

    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
    public updateTalentItem(talent : Lobby.eTalentType,talentName : string,cost : number) : void{

		this._talent = talent;

		if (talent > Lobby.eTalentType.TALENT_B2) {
			this.costName.string = "<color=#FFE8AEFF>高级天赋 " + talentName +"</color>";
			this.costNum.string = "<color=#FFE8AEFF>消耗+" + cost+"</color>";
		} else {
			this.costName.string = "<color=#261601>基础天赋 " + talentName +"</color>";
			this.costNum.string = "<color=#261601>消耗+" + cost + "</color>";
		}
	}

	public getTalentType() : Lobby.eTalentType {
		return this._talent;
	}
}
