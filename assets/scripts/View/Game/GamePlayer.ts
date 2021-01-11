// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Sprite, Label, Button, resources, SpriteFrame, tween, Vec3 } from 'cc';
import { CommonDefine } from '../../Define/CommonDefine';
const { ccclass, property } = _decorator;
import { ProtocolDefine } from  "../../Define/ProtocolDefine"

@ccclass('GamePlayer')
export class GamePlayer extends Component {
    @property(Sprite)
    public bg! : Sprite;
    
    @property(Sprite)
	public headbg! : Sprite;
    
    @property(Button)
	public head! : Button;
    
    @property(Sprite)
	public nickBg! : Sprite;
    
    @property(Label)
	public nick! : Label;
    
    @property(Sprite)
	public chatBg! : Sprite;
    
    @property(Label)
	public chatMsg! : Label;
    
    @property(Label)
	public currentScore! : Label;

	//更多信息，财富、段位等
	private seat : number = 0;
	private isSelf : boolean = false;

    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    public OnClickHead() : void{
		if (!this.isSelf) {
			//show nick
			this.nickBg.node.active = !this.nickBg.node.active;
		}
    }
    public getPlayerName() : string{
		return this.nick.string;
	}

	public updatePlayer(self : boolean,isOwner : boolean,seat : number,head : string,sex : number,nickname : string) : void{
		this.seat = seat;
		this.isSelf = self;
        
        resources.load(CommonDefine.ResPath.PLAYER_BG + seat + "/spriteFrame",SpriteFrame, (err, spriteFrame) => {
            this.headbg.spriteFrame  = spriteFrame!;
            //spriteFrame.addRef();
        });
        resources.load(CommonDefine.ResPath.PLAYER_HEAD + seat + "/spriteFrame",SpriteFrame, (err, spriteFrame) => {
            this.head.getComponent(Sprite)!.spriteFrame = spriteFrame!;
            //spriteFrame.addRef();
        });
        
		this.nick.string = nickname;
		//_chatBg
		this.chatBg.node.active = false;
		if (self) {
			this.bg.node.active = true;
			this.node.setScale(1,1);
		} else {
			this.node.setScale(0.75,0.75);
			this.bg.node.active = false;
		}

		this.currentScore.string = "0";

		this.nickBg.node.active = false;
	}
	public showChatMsg(content : string) : void{
		this.chatBg.node.active = true;
		this.chatMsg.string = content;
		this.chatBg.node.setScale(0,0);
		
		tween(this.chatBg.node)
		.to(1, { scale: new Vec3(1, 1, 1) }, { easing: 'bounceOut' })
		.delay(2)
		.to(0, { scale: new Vec3(0, 0, 0) })
		.start();
	}
	public updateScore(score : number) : void{

		// 这里可以实现分数变化动画
		this.currentScore.string = ""+score;
	}

	public updateState(state : ProtocolDefine.nRoom.eStateType) : void{
		// 这里只处理用户上线(游戏中)和离线
		if(state == ProtocolDefine.nRoom.eStateType.STATE_TYPE_OFFLINE){
			this.head.interactable = false;
		}else if(state == ProtocolDefine.nRoom.eStateType.STATE_TYPE_PLAYING){
			this.head.interactable = true;
		}
	}
}
