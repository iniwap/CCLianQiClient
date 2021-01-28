// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Sprite, Label, resources, SpriteFrame } from 'cc';
import { CommonDefine } from '../../../Define/CommonDefine';
const { ccclass, property } = _decorator;

@ccclass('RankItem')
export class RankItem extends Component {
    @property(Sprite)
    public rankItemIcon! : Sprite;
    @property(Label)
    public rankItemName! : Label;
    @property(Label)
    public rankItemScore! : Label;
    @property(Label)
	public rankItemRankNum! : Label;

    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
    public updateRankItem(rank : number,nick : string,score : string) : void{
		if (rank > 3) {
			this.rankItemIcon.node.active = false;
			this.rankItemRankNum.node.active = true;

			this.rankItemRankNum.string = ""+rank;

			this.rankItemName.fontSize = 40;
			this.rankItemScore.fontSize = 40;
		} else {
			this.rankItemIcon.node.active = true;
            resources.load(CommonDefine.ResPath.RANK_NUM_ICON + rank + "/spriteFrame",SpriteFrame,(err,spriteFrame)=>{
                this.rankItemIcon.spriteFrame = spriteFrame!;
            });
			this.rankItemRankNum.node.active = false;

			this.rankItemName.fontSize = 48;
			this.rankItemScore.fontSize = 48;
		}
		this.rankItemName.string = nick;
		this.rankItemScore.string = score;
	}
}
