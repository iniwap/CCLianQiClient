// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node, Sprite, Label, RichText, resources, SpriteFrame } from 'cc';
import { CommonDefine } from '../../Define/CommonDefine';
const { ccclass, property } = _decorator;

@ccclass('PlayerScore')
export class PlayerScore extends Component {
    @property(Sprite)
    public headBg! : Sprite;
    @property(Sprite)
	public head !: Sprite;
    @property(Sprite)
	public owner! : Sprite;
    @property(Sprite)
	public scoreBg! : Sprite;
    @property(Sprite)
	public rankIcon! : Sprite;//只会存在一个
    
    @property(Label)
	public rankText! : Label;


    @property(Label)
	public nickname! : Label;
    
    @property(RichText)
	public areaText! : RichText;//领地text
    
    @property(RichText)
	public killText! : RichText;
    
    @property(RichText)
	public scoreText! : RichText;
    
    @property(Label)
	public multText! : Label;
    
    @property(Sprite)
	public multi! : Sprite;
    
    @property(Sprite)
	public abandonFlag! : Sprite;
    
    @property(Label)
	public abandonText! : Label;

    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    public OnMultiBtnClick(){

    }
    public updatePlayScore(isSelf : boolean,rank : number,seat : number,showOwner : boolean,
		head : string,name : string,area : number,kill : number,score : number,multi : number,hasAbandon : boolean) : void{

		if (isSelf) {
			this.scoreBg.node.active = true;
		} else {
			this.scoreBg.node.active = false;
		}

		if (showOwner) {
			this.owner.node.active = true;
		} else {
			this.owner.node.active = false;
		}

        resources.load(CommonDefine.ResPath.ROOM_HEAD_BG + seat + "/spriteFrame",
            SpriteFrame, (err, spriteFrame) => {
                this.headBg.spriteFrame = spriteFrame!;
                //spriteFrame.addRef();
        });
        
        resources.load(CommonDefine.ResPath.ROOM_HEAD + seat + "/spriteFrame",
            SpriteFrame, (err, spriteFrame) => {
                this.head.spriteFrame = spriteFrame!;
                //spriteFrame.addRef();
        });

		if (rank > 3) {
			this.rankIcon.node.active = false;
			this.rankText.node.active = true;

			this.rankText.string = ""+rank;
		} else {
			this.rankIcon.node.active = true;
            this.rankText.node.active = false;
            resources.load(CommonDefine.ResPath.RANK_NUM_ICON + rank + "/spriteFrame",
                SpriteFrame, (err, spriteFrame) => {
                    this.rankIcon.spriteFrame = spriteFrame!;
                    //spriteFrame.addRef();
            });
		}

		this.nickname.string = name;
		this.areaText.string = "<color=#aaaaff>领地</color><color=yellow>  "  + area + "</color>";
		this.killText.string = "<color=#aaaaff>消灭</color><color=yellow>  "  + kill + "</color>";

		let scoreStr : string = "";
		if (score < 0) {
			scoreStr = scoreStr + score;
		} else if (score >= 0) {
			scoreStr = scoreStr + "+" + score;
		}
		this.scoreText.string = "<color=#aaaaff>积分</color><color=yellow>  "  + scoreStr + "</color>";

		if (multi > 1) {
			this.multText.string = "x" + multi;
		} else {
			this.multi.node.active = false;
		}

		if (hasAbandon) {
			this.abandonFlag.node.active = true;
			this.abandonText.node.active = true;

			this.abandonText.string = "+" + score;

			this.scoreText.string = "<color=#aaaaff>积分</color><color=yellow>  --</color>";

		} else {
			this.abandonFlag.node.active = false;
			this.abandonText.node.active = false;
        }
    }
}
